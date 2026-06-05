# 02 — Database Schema: PostgreSQL / Supabase DDL

**Project:** WC2026 Internal Betting App
**Database:** Supabase (PostgreSQL 15+)

> Run all DDL blocks in order inside the Supabase SQL Editor.
> Supabase service role is required for admin user-creation calls.

---

## Part 1 — Enums

```sql
CREATE TYPE user_role      AS ENUM ('admin', 'superuser', 'user');

CREATE TYPE match_status   AS ENUM (
  'SCHEDULED',           -- Future match, betting open
  'LIVE',                -- Match in progress (optional UI flag)
  'PENDING_SETTLEMENT',  -- Score entered, 15-min correction window
  'SETTLED',             -- Locked; bets scored; immutable
  'POSTPONED',           -- Delayed; auto-VOID after 48 h
  'ABANDONED',           -- Match cancelled mid-game
  'VOID'                 -- No penalty applied; bets reset
);

CREATE TYPE match_result   AS ENUM ('HOME_WIN', 'DRAW', 'AWAY_WIN');
CREATE TYPE bet_prediction AS ENUM ('HOME_WIN', 'DRAW', 'AWAY_WIN');
```

---

## Part 2 — Core Tables

### 2.1 profiles (extends auth.users)

```sql
CREATE TABLE profiles (
  id                   UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username             TEXT        UNIQUE NOT NULL,
  display_name         TEXT        NOT NULL,
  role                 user_role   NOT NULL DEFAULT 'user',
  must_change_password BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on Supabase Auth signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, username, display_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email,'@',1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'user')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### 2.2 teams

```sql
CREATE TABLE teams (
  id           SERIAL      PRIMARY KEY,
  name         TEXT        NOT NULL,
  country_code CHAR(3)     NOT NULL UNIQUE,  -- ISO 3166-1 alpha-3
  group_name   CHAR(1),                       -- A–L; NULL for knockout-only entries
  flag_emoji   TEXT
);
```

### 2.3 match_rounds (flexible catalog — fixes Gap #1)

```sql
CREATE TABLE match_rounds (
  id            TEXT        PRIMARY KEY,
  name          TEXT        NOT NULL,
  display_order INTEGER     NOT NULL UNIQUE
);

-- Seed: all 7 stages of WC2026 (5 knockout rounds, not 4)
INSERT INTO match_rounds (id, name, display_order) VALUES
  ('group_stage',  'Vòng Bảng',          1),
  ('round_of_32',  'Vòng 32 Đội',        2),
  ('round_of_16',  'Vòng 16 Đội (1/8)',  3),
  ('quarterfinal', 'Tứ Kết',             4),
  ('semifinal',    'Bán Kết',            5),
  ('third_place',  'Tranh Hạng 3',       6),
  ('final',        'Chung Kết',          7);
```

### 2.4 matches

```sql
CREATE TABLE matches (
  id                      UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  home_team_id            INTEGER      NOT NULL REFERENCES teams(id),
  away_team_id            INTEGER      NOT NULL REFERENCES teams(id),
  round_id                TEXT         NOT NULL REFERENCES match_rounds(id),
  match_datetime          TIMESTAMPTZ  NOT NULL,   -- always stored in UTC
  venue                   TEXT,
  status                  match_status NOT NULL DEFAULT 'SCHEDULED',
  home_score              INTEGER,
  away_score              INTEGER,
  result                  match_result,             -- computed by trigger
  settlement_requested_at TIMESTAMPTZ,              -- set when → PENDING_SETTLEMENT
  external_match_id       TEXT         UNIQUE,      -- Bet365 / The Odds API ID
  notes                   TEXT,
  created_by              UUID         REFERENCES auth.users(id),
  created_at              TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_different_teams    CHECK (home_team_id <> away_team_id),
  CONSTRAINT chk_scores_paired      CHECK ((home_score IS NULL) = (away_score IS NULL)),
  CONSTRAINT chk_scores_non_neg     CHECK (home_score IS NULL OR (home_score >= 0 AND away_score >= 0)),
  CONSTRAINT chk_result_needs_score CHECK (result IS NULL OR home_score IS NOT NULL),
  CONSTRAINT chk_pending_has_time   CHECK (
    settlement_requested_at IS NULL OR status IN ('PENDING_SETTLEMENT','SETTLED')
  )
);

CREATE INDEX idx_matches_datetime ON matches(match_datetime);
CREATE INDEX idx_matches_status   ON matches(status);
CREATE INDEX idx_matches_round    ON matches(round_id);

-- Trigger: auto-compute result from scores
CREATE OR REPLACE FUNCTION trg_fn_compute_result()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.home_score IS NOT NULL AND NEW.away_score IS NOT NULL THEN
    NEW.result := CASE
      WHEN NEW.home_score > NEW.away_score THEN 'HOME_WIN'::match_result
      WHEN NEW.home_score < NEW.away_score THEN 'AWAY_WIN'::match_result
      ELSE 'DRAW'::match_result
    END;
  END IF;
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_compute_result
  BEFORE INSERT OR UPDATE OF home_score, away_score ON matches
  FOR EACH ROW EXECUTE FUNCTION trg_fn_compute_result();
```

### 2.5 bets

```sql
CREATE TABLE bets (
  id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  match_id       UUID         NOT NULL REFERENCES matches(id)    ON DELETE CASCADE,
  prediction     bet_prediction NOT NULL,
  placed_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),  -- DB server time (Gap #2)
  is_correct     BOOLEAN,                              -- NULL until SETTLED
  penalty_points INTEGER      NOT NULL DEFAULT 0 CHECK (penalty_points IN (0, 50)),

  UNIQUE (user_id, match_id)
);

CREATE INDEX idx_bets_user_id  ON bets(user_id);
CREATE INDEX idx_bets_match_id ON bets(match_id);

-- Trigger: auto-settle bets when match → SETTLED; reset when → VOID
CREATE OR REPLACE FUNCTION trg_fn_settle_bets()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.status = 'SETTLED' AND OLD.status = 'PENDING_SETTLEMENT' THEN
    UPDATE bets
    SET
      is_correct     = (prediction = NEW.result),
      penalty_points = CASE WHEN prediction = NEW.result THEN 0 ELSE 50 END
    WHERE match_id = NEW.id;
  END IF;

  IF NEW.status = 'VOID' AND OLD.status <> 'VOID' THEN
    UPDATE bets
    SET is_correct = NULL, penalty_points = 0
    WHERE match_id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_settle_bets
  AFTER UPDATE OF status ON matches
  FOR EACH ROW EXECUTE FUNCTION trg_fn_settle_bets();
```

### 2.6 audit_log (immutable transparency record)

```sql
CREATE TABLE audit_log (
  id         BIGSERIAL   PRIMARY KEY,
  actor_id   UUID        REFERENCES auth.users(id),
  action     TEXT        NOT NULL,   -- INSERT | UPDATE
  table_name TEXT        NOT NULL,
  record_id  TEXT        NOT NULL,
  old_data   JSONB,
  new_data   JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION trg_fn_audit_matches()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO audit_log(actor_id, action, table_name, record_id, old_data, new_data)
  VALUES (auth.uid(), TG_OP, 'matches', NEW.id::TEXT,
          row_to_json(OLD)::JSONB, row_to_json(NEW)::JSONB);
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_audit_matches
  AFTER UPDATE ON matches
  FOR EACH ROW EXECUTE FUNCTION trg_fn_audit_matches();
```

---

## Part 3 — Leaderboard View (Multi-tier Sort — fixes Gap #4)

```sql
CREATE OR REPLACE VIEW leaderboard AS
WITH settled_bets AS (
  SELECT
    b.user_id, b.prediction, b.is_correct, b.penalty_points, b.placed_at,
    ROW_NUMBER() OVER (PARTITION BY b.user_id ORDER BY m.match_datetime DESC) AS rn_desc
  FROM bets b
  JOIN matches m ON b.match_id = m.id
  WHERE m.status = 'SETTLED'
),
player_totals AS (
  SELECT
    user_id,
    SUM(penalty_points)::INTEGER  AS total_penalty_points,
    MIN(placed_at)                AS earliest_bet_at,
    COUNT(*) FILTER (WHERE is_correct = TRUE)  AS correct_count,
    COUNT(*) FILTER (WHERE is_correct = FALSE) AS wrong_count
  FROM settled_bets
  GROUP BY user_id
),
-- Current streak: count consecutive correct from most recent match backwards
streak_breaks AS (
  SELECT user_id, rn_desc,
    SUM(CASE WHEN is_correct = FALSE THEN 1 ELSE 0 END)
      OVER (PARTITION BY user_id ORDER BY rn_desc) AS break_count
  FROM settled_bets
),
current_streaks AS (
  SELECT user_id,
    COUNT(*) FILTER (WHERE is_correct = TRUE AND break_count = 0) AS current_streak
  FROM streak_breaks
  GROUP BY user_id
)
SELECT
  p.id            AS user_id,
  p.display_name,
  COALESCE(pt.total_penalty_points, 0)  AS total_penalty_points,
  COALESCE(cs.current_streak, 0)        AS current_streak,
  COALESCE(pt.correct_count, 0)         AS correct_count,
  COALESCE(pt.wrong_count, 0)           AS wrong_count,
  pt.earliest_bet_at,
  RANK() OVER (
    ORDER BY
      COALESCE(pt.total_penalty_points, 0) ASC,   -- Tier 1: fewest penalty points
      COALESCE(cs.current_streak, 0) DESC,          -- Tier 2: longest current streak
      COALESCE(pt.earliest_bet_at, NOW()) ASC       -- Tier 3: earliest bet placed
  ) AS rank
FROM profiles p
LEFT JOIN player_totals  pt ON p.id = pt.user_id
LEFT JOIN current_streaks cs ON p.id = cs.user_id
WHERE p.role = 'user';
```

---

## Part 4 — RPC Functions

### 4.1 settle_match (Superuser — Gap #3: two-step settlement)

```sql
CREATE OR REPLACE FUNCTION settle_match(
  p_match_id   UUID,
  p_home_score INTEGER,
  p_away_score INTEGER
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_match matches;
BEGIN
  IF (SELECT role FROM profiles WHERE id = auth.uid()) NOT IN ('superuser','admin') THEN
    RETURN jsonb_build_object('success',false,'error','Unauthorized');
  END IF;

  SELECT * INTO v_match FROM matches WHERE id = p_match_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success',false,'error','Match not found');
  END IF;
  IF v_match.status NOT IN ('SCHEDULED','LIVE') THEN
    RETURN jsonb_build_object('success',false,'error','Match not in settable state');
  END IF;

  UPDATE matches SET
    status                  = 'PENDING_SETTLEMENT',
    home_score              = p_home_score,
    away_score              = p_away_score,
    settlement_requested_at = NOW(),
    updated_at              = NOW()
  WHERE id = p_match_id;

  RETURN jsonb_build_object(
    'success', true,
    'match_id', p_match_id,
    'status', 'PENDING_SETTLEMENT',
    'settles_at', (NOW() + INTERVAL '15 minutes')
  );
END;
$$;
```

### 4.2 confirm_match_settlement (called by Vercel Cron after 15 min)

```sql
CREATE OR REPLACE FUNCTION confirm_match_settlement(p_match_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_match matches;
BEGIN
  SELECT * INTO v_match FROM matches WHERE id = p_match_id FOR UPDATE;

  IF v_match.status <> 'PENDING_SETTLEMENT' THEN
    RETURN jsonb_build_object('success',false,'error','Not pending');
  END IF;
  IF v_match.settlement_requested_at > NOW() - INTERVAL '15 minutes' THEN
    RETURN jsonb_build_object(
      'success', false, 'error', 'Window still open',
      'seconds_remaining',
      EXTRACT(EPOCH FROM (v_match.settlement_requested_at + INTERVAL '15 minutes' - NOW()))::INTEGER
    );
  END IF;

  UPDATE matches SET status = 'SETTLED', updated_at = NOW() WHERE id = p_match_id;
  -- trg_settle_bets fires here automatically

  RETURN jsonb_build_object('success',true,'match_id',p_match_id,'status','SETTLED');
END;
$$;
```

### 4.3 void_postponed_matches (called by daily Vercel Cron — Gap #5)

```sql
CREATE OR REPLACE FUNCTION void_postponed_matches()
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE affected INTEGER;
BEGIN
  UPDATE matches
  SET status = 'VOID', updated_at = NOW()
  WHERE status = 'POSTPONED'
    AND match_datetime < NOW() - INTERVAL '48 hours';
  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected;
END;
$$;
```

---

## Part 5 — Row Level Security (RLS)

```sql
ALTER TABLE profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams       ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches     ENABLE ROW LEVEL SECURITY;
ALTER TABLE bets        ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log   ENABLE ROW LEVEL SECURITY;

-- Helper (cached per query)
CREATE OR REPLACE FUNCTION my_role()
RETURNS user_role LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$;
```

### profiles

```sql
-- All authenticated users can read all profiles (transparency)
CREATE POLICY "profiles_read_all"   ON profiles FOR SELECT TO authenticated USING (true);

-- Only admin can create profiles
CREATE POLICY "profiles_insert_admin" ON profiles FOR INSERT TO authenticated
  WITH CHECK (my_role() = 'admin');

-- Users can update own non-privileged fields only
CREATE POLICY "profiles_update_self"  ON profiles FOR UPDATE TO authenticated
  USING  (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND role = (SELECT role FROM profiles WHERE id = auth.uid())  -- no self-promotion
  );

-- Admin can update any profile (role changes, etc.)
CREATE POLICY "profiles_update_admin" ON profiles FOR UPDATE TO authenticated
  USING (my_role() = 'admin');
```

### matches

```sql
CREATE POLICY "matches_read_all"    ON matches FOR SELECT TO authenticated USING (true);
CREATE POLICY "matches_insert_op"   ON matches FOR INSERT TO authenticated
  WITH CHECK (my_role() IN ('admin','superuser'));
CREATE POLICY "matches_update_op"   ON matches FOR UPDATE TO authenticated
  USING  (my_role() IN ('admin','superuser'))
  WITH CHECK (
    -- Immutability: once SETTLED, score/result columns cannot change
    OLD.status <> 'SETTLED' OR (
      NEW.home_score IS NOT DISTINCT FROM OLD.home_score AND
      NEW.away_score IS NOT DISTINCT FROM OLD.away_score AND
      NEW.result     IS NOT DISTINCT FROM OLD.result
    )
  );
```

### bets (Gap #2 enforced at DB level)

```sql
-- All authenticated users can read all bets (public transparency rule)
CREATE POLICY "bets_read_all" ON bets FOR SELECT TO authenticated USING (true);

-- Place bet: own user_id, match SCHEDULED, kickoff in the FUTURE (server NOW())
CREATE POLICY "bets_insert_own_before_kickoff" ON bets FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM matches
      WHERE id    = match_id
        AND status = 'SCHEDULED'
        AND match_datetime > NOW()   -- Supabase server time — no client clock trust
    )
  );

-- Update bet: same conditions as insert
CREATE POLICY "bets_update_own_before_kickoff" ON bets FOR UPDATE TO authenticated
  USING  (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM matches
      WHERE id    = match_id
        AND status = 'SCHEDULED'
        AND match_datetime > NOW()
    )
  );

-- Nobody can delete bets (immutable audit trail)
CREATE POLICY "bets_no_delete" ON bets FOR DELETE TO authenticated USING (false);
```

### audit_log & read-only tables

```sql
CREATE POLICY "teams_read_all"       ON teams        FOR SELECT TO authenticated USING (true);
CREATE POLICY "rounds_read_all"      ON match_rounds FOR SELECT TO authenticated USING (true);
CREATE POLICY "audit_read_ops"       ON audit_log    FOR SELECT TO authenticated
  USING (my_role() IN ('admin','superuser'));
```
