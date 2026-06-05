-- ==========================================
-- RPC: Admin settle or re-settle a match
-- Usage: SELECT settle_match_result('match-uuid', 2, 1);
-- ==========================================

-- Drop old trigger that hardcodes settlement logic
DROP TRIGGER IF EXISTS trg_settle_bets ON matches;

-- Also drop old function used by that trigger to avoid confusion
DROP FUNCTION IF EXISTS trg_fn_settle_bets();

-- Add 'NOT_BET' to bet_prediction enum if not already present
ALTER TYPE bet_prediction ADD VALUE IF NOT EXISTS 'NOT_BET';

CREATE OR REPLACE FUNCTION settle_match_result(
  in_away_score     INTEGER,
  in_home_score     INTEGER,
  in_match_id       UUID,
  in_penalty_points INTEGER DEFAULT 50
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth AS $$
DECLARE
  v_match      matches;
  v_new_result match_result;
BEGIN
  -- Only admin or superuser
-- ==========================================
-- RPC: Admin settle or re-settle a match
-- Usage: SELECT settle_match_result('match-uuid', 2, 1);
-- ==========================================

-- Drop old trigger that hardcodes settlement logic
DROP TRIGGER IF EXISTS trg_settle_bets ON matches;

-- Also drop old function used by that trigger to avoid confusion
DROP FUNCTION IF EXISTS trg_fn_settle_bets();

-- Add 'NOT_BET' to bet_prediction enum if not already present
ALTER TYPE bet_prediction ADD VALUE IF NOT EXISTS 'NOT_BET';

CREATE OR REPLACE FUNCTION settle_match_result(
  in_away_score     INTEGER,
  in_home_score     INTEGER,
  in_match_id       UUID,
  in_penalty_points INTEGER DEFAULT 50
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_match      matches;
  v_new_result match_result;
BEGIN
  -- Only admin
  IF (SELECT role FROM profiles WHERE id = auth.uid()) != 'admin' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  -- Check match exists
  SELECT * INTO v_match FROM matches WHERE id = in_match_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Match not found');
  END IF;

  -- Compute result
  IF in_home_score > in_away_score THEN
    v_new_result := 'HOME_WIN'::match_result;
  ELSIF in_home_score < in_away_score THEN
    v_new_result := 'AWAY_WIN'::match_result;
  ELSE
    v_new_result := 'DRAW'::match_result;
  END IF;

  -- Update match with score and status
  UPDATE matches SET
    home_score = in_home_score,
    away_score = in_away_score,
    result     = v_new_result,
    status     = 'SETTLED',
    updated_at = NOW()
  WHERE id = in_match_id;

  -- Recalculate all existing bets for this match FIRST
  UPDATE bets SET
    is_correct     = CASE WHEN prediction::text = v_new_result::text THEN TRUE ELSE FALSE END,
    penalty_points = CASE WHEN prediction::text = v_new_result::text THEN 0 ELSE in_penalty_points END
  WHERE match_id = in_match_id;

  -- Auto-create losing bets with 'NOT_BET' for users who didn't place a bet
  INSERT INTO bets (user_id, match_id, prediction, placed_at, is_correct, penalty_points)
  SELECT
    au.id,
    in_match_id,
    'NOT_BET'::bet_prediction,
    NOW(),
    FALSE,
    in_penalty_points
  FROM auth.users au
  LEFT JOIN profiles p ON p.id = au.id
  WHERE (p.role IS NULL OR p.role != 'admin')
    AND NOT EXISTS (
      SELECT 1 FROM bets b WHERE b.match_id = in_match_id AND b.user_id = au.id
    );

  RETURN jsonb_build_object(
    'success', true,
    'match_id', in_match_id,
    'status', 'SETTLED',
    'result', v_new_result,
    'home_score', in_home_score,
    'away_score', in_away_score,
    'penalty_points', in_penalty_points
  );
END;
$$;
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  -- Check match exists
  SELECT * INTO v_match FROM matches WHERE id = in_match_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Match not found');
  END IF;

  -- Compute result
  IF in_home_score > in_away_score THEN
    v_new_result := 'HOME_WIN'::match_result;
  ELSIF in_home_score < in_away_score THEN
    v_new_result := 'AWAY_WIN'::match_result;
  ELSE
    v_new_result := 'DRAW'::match_result;
  END IF;

  -- Update match with score and status
  UPDATE matches SET
    home_score = in_home_score,
    away_score = in_away_score,
    result     = v_new_result,
    status     = 'SETTLED',
    updated_at = NOW()
  WHERE id = in_match_id;

  -- Recalculate all existing bets for this match FIRST
  UPDATE bets SET
    is_correct     = CASE WHEN prediction::text = v_new_result::text THEN TRUE ELSE FALSE END,
    penalty_points = CASE WHEN prediction::text = v_new_result::text THEN 0 ELSE in_penalty_points END
  WHERE match_id = in_match_id;

  -- Auto-create losing bets with 'NOT_BET' for users who didn't place a bet
  -- Use profiles directly (profiles.id = auth.users.id via trigger on signup)
  INSERT INTO bets (user_id, match_id, prediction, placed_at, is_correct, penalty_points)
  SELECT
    p.id,
    in_match_id,
    'NOT_BET'::bet_prediction,
    NOW(),
    FALSE,
    in_penalty_points
  FROM profiles p
  WHERE p.role NOT IN ('admin', 'superuser')
    AND NOT EXISTS (
      SELECT 1 FROM bets b WHERE b.match_id = in_match_id AND b.user_id = p.id
    );

  RETURN jsonb_build_object(
    'success', true,
    'match_id', in_match_id,
    'status', 'SETTLED',
    'result', v_new_result,
    'home_score', in_home_score,
    'away_score', in_away_score,
    'penalty_points', in_penalty_points
  );
END;
$$;
