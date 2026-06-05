-- WC2026 Database Schema
-- Run in Supabase SQL Editor (SQL Editor -> New Query -> Paste and Run)
-- Order: Enums -> Tables -> Views -> Functions -> RLS

-- ============================================================
-- PART 1: ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM ('admin', 'superuser', 'user');

CREATE TYPE match_status AS ENUM (
  'SCHEDULED',
  'LIVE',
  'PENDING_SETTLEMENT',
  'SETTLED',
  'POSTPONED',
  'ABANDONED',
  'VOID'
);

CREATE TYPE match_result AS ENUM ('HOME_WIN', 'DRAW', 'AWAY_WIN');
CREATE TYPE bet_prediction AS ENUM ('HOME_WIN', 'DRAW', 'AWAY_WIN', 'NOT_BET');

-- ============================================================
-- PART 2: TABLES
-- ============================================================

-- 2.1 profiles
CREATE TABLE profiles (
  id                   UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username             TEXT        UNIQUE NOT NULL,
  display_name         TEXT        NOT NULL,
  role                 user_role   NOT NULL DEFAULT 'user',
  must_change_password BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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

-- 2.2 teams
CREATE TABLE teams (
  id           SERIAL      PRIMARY KEY,
  name         TEXT        NOT NULL,
  country_code CHAR(3)     NOT NULL UNIQUE,
  group_name   CHAR(1),
  flag_emoji   TEXT
);

-- 2.3 match_rounds
CREATE TABLE match_rounds (
  id            TEXT        PRIMARY KEY,
  name          TEXT        NOT NULL,
  display_order INTEGER     NOT NULL UNIQUE
);

INSERT INTO match_rounds (id, name, display_order) VALUES
  ('group_stage',  'Vòng Bảng',          1),
  ('round_of_32',  'Vòng 32 Đội',        2),
  ('round_of_16',  'Vòng 16 Đội (1/8)',  3),
  ('quarterfinal', 'Tứ Kết',             4),
  ('semifinal',    'Bán Kết',            5),
  ('third_place',  'Tranh Hạng 3',       6),
  ('final',        'Chung Kết',          7);

-- 2.4 matches
CREATE TABLE matches (
  id                      UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  home_team_id            INTEGER      NOT NULL REFERENCES teams(id),
  away_team_id            INTEGER      NOT NULL REFERENCES teams(id),
  round_id                TEXT         NOT NULL REFERENCES match_rounds(id),
  match_datetime          TIMESTAMPTZ  NOT NULL,
  venue                   TEXT,
  status                  match_status NOT NULL DEFAULT 'SCHEDULED',
  home_score              INTEGER,
  away_score              INTEGER,
  result                  match_result,
  settlement_requested_at TIMESTAMPTZ,
  external_match_id       TEXT         UNIQUE,
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

-- 2.5 bets
CREATE TABLE bets (
  id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  match_id       UUID         NOT NULL REFERENCES matches(id)    ON DELETE CASCADE,
  prediction     bet_prediction NOT NULL,
  placed_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  is_correct     BOOLEAN,
  penalty_points INTEGER      NOT NULL DEFAULT 0 CHECK (penalty_points IN (0, 50)),

  UNIQUE (user_id, match_id)
);

CREATE INDEX idx_bets_user_id  ON bets(user_id);
CREATE INDEX idx_bets_match_id ON bets(match_id);

-- 2.6 audit_log
CREATE TABLE audit_log (
  id         BIGSERIAL   PRIMARY KEY,
  actor_id   UUID        REFERENCES auth.users(id),
  action     TEXT        NOT NULL,
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
  VALUES (
    auth.uid(),
    'UPDATE',
    'matches',
    NEW.id,
    jsonb_build_object('home_team_id', OLD.home_team_id, 'away_team_id', OLD.away_team_id, 'status', OLD.status),
    jsonb_build_object('home_team_id', NEW.home_team_id, 'away_team_id', NEW.away_team_id, 'status', NEW.status)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_audit_matches
  AFTER UPDATE ON matches
  FOR EACH ROW EXECUTE FUNCTION trg_fn_audit_matches();

-- ============================================================
-- PART 3: LEADERBOARD VIEW
-- ============================================================

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
streak_breaks AS (
  SELECT user_id, rn_desc, is_correct,
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
      COALESCE(pt.total_penalty_points, 0) ASC,
      COALESCE(cs.current_streak, 0) DESC,
      COALESCE(pt.earliest_bet_at, NOW()) ASC
  ) AS rank
FROM profiles p
LEFT JOIN player_totals  pt ON p.id = pt.user_id
LEFT JOIN current_streaks cs ON p.id = cs.user_id
WHERE p.role IN ('user', 'admin', 'superuser');

-- ============================================================
-- PART 4: RPC FUNCTIONS
-- ============================================================

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

  RETURN jsonb_build_object('success',true,'match_id',p_match_id,'status','SETTLED');
END;
$$;

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

-- ============================================================
-- PART 5: ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams          ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_rounds   ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches        ENABLE ROW LEVEL SECURITY;
ALTER TABLE bets           ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log      ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION my_role()
RETURNS user_role LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$;

-- profiles policies
CREATE POLICY "profiles_read_all"   ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_insert_admin" ON profiles FOR INSERT TO authenticated WITH CHECK (my_role() = 'admin');
CREATE POLICY "profiles_update_self"  ON profiles FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid() AND role = (SELECT role FROM profiles WHERE id = auth.uid()));
CREATE POLICY "profiles_update_admin" ON profiles FOR UPDATE TO authenticated USING (my_role() = 'admin');

-- matches policies
CREATE POLICY "matches_read_all"    ON matches FOR SELECT TO authenticated USING (true);
CREATE POLICY "matches_insert_op"   ON matches FOR INSERT TO authenticated WITH CHECK (my_role() IN ('admin','superuser'));
CREATE POLICY "matches_update_op"   ON matches FOR UPDATE TO authenticated
  USING (my_role() IN ('admin','superuser'));

-- bets policies
CREATE POLICY "bets_read_all" ON bets FOR SELECT TO authenticated USING (true);
CREATE POLICY "bets_insert_own_before_kickoff" ON bets FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM matches
      WHERE id = match_id AND status = 'SCHEDULED' AND match_datetime > NOW()
    )
  );
CREATE POLICY "bets_update_own_before_kickoff" ON bets FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM matches
      WHERE id = match_id AND status = 'SCHEDULED' AND match_datetime > NOW()
    )
  );
CREATE POLICY "bets_no_delete" ON bets FOR DELETE TO authenticated USING (false);

-- read-only tables
CREATE POLICY "teams_read_all"       ON teams        FOR SELECT TO authenticated USING (true);
CREATE POLICY "rounds_read_all"       ON match_rounds  FOR SELECT TO authenticated USING (true);
CREATE POLICY "audit_read_ops"        ON audit_log     FOR SELECT TO authenticated USING (my_role() IN ('admin','superuser'));