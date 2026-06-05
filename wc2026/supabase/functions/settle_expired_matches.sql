-- Function to automatically settle matches that have passed their datetime
-- Uses the same settle_match_result RPC logic to ensure consistency
CREATE OR REPLACE FUNCTION settle_expired_matches()
RETURNS TABLE(id UUID, success BOOLEAN, error TEXT) AS $$
DECLARE
  match_record RECORD;
  result_json JSONB;
BEGIN
  FOR match_record IN
    SELECT id, match_datetime, status
    FROM matches
    WHERE status = 'SCHEDULED'
      AND match_datetime < NOW()
  LOOP
    BEGIN
      -- Call settle_match_result with default 0-0 and penalty 50
      -- This will properly insert NOT_BET for users who didn't bet
      result_json := settle_match_result(0, 0, match_record.id, 50);

      IF (result_json->>'success')::boolean THEN
      id := match_record.id;
      success := TRUE;
      ELSE
      id := match_record.id;
      success := FALSE;
        error := result_json->>'error';
      END IF;
    EXCEPTION WHEN OTHERS THEN
      id := match_record.id;
      success := FALSE;
      error := SQLERRM;
    END;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to void postponed matches after 24 hours
CREATE OR REPLACE FUNCTION void_old_postponed_matches()
RETURNS TABLE(id UUID, success BOOLEAN, error TEXT) AS $$
DECLARE
  match_record RECORD;
BEGIN
  FOR match_record IN
    SELECT id
    FROM matches
    WHERE status = 'POSTPONED'
      AND match_datetime < NOW() - INTERVAL '24 hours'
  LOOP
    BEGIN
      UPDATE matches
      SET status = 'VOID'
      WHERE id = match_record.id;

      UPDATE bets
      SET prediction = 'VOID'
      WHERE match_id = match_record.id
        AND prediction != 'VOID';

      id := match_record.id;
      success := TRUE;
    EXCEPTION WHEN OTHERS THEN
      id := match_record.id;
      success := FALSE;
      error := SQLERRM;
    END;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to recalculate leaderboard scores
CREATE OR REPLACE FUNCTION recalculate_all_scores()
RETURNS TABLE(user_id UUID, correct_predictions INT, penalties INT, success BOOLEAN) AS $$
DECLARE
  user_record RECORD;
  bet_record RECORD;
  correct INT;
  penalties INT;
BEGIN
  FOR user_record IN SELECT id FROM profiles LOOP
    correct := 0;
    penalties := 0;

    FOR bet_record IN
      SELECT b.prediction, m.result
      FROM bets b
      JOIN matches m ON b.match_id = m.id
      WHERE b.user_id = user_record.id
        AND b.prediction != 'VOID'
        AND m.status = 'SETTLED'
    LOOP
      IF bet_record.prediction = bet_record.result THEN
        correct := correct + 1;
      END IF;
    END LOOP;

    BEGIN
      UPDATE profiles
      SET
        points = correct,
        penalties = penalties,
        updated_at = NOW()
      WHERE id = user_record.id;

      user_id := user_record.id;
      correct_predictions := correct;
      penalties := penalties;
      success := TRUE;
    EXCEPTION WHEN OTHERS THEN
      user_id := user_record.id;
      correct_predictions := correct;
      penalties := penalties;
      success := FALSE;
    END;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Cron job schedule (run every 5 minutes)
-- Note: This requires pg_cron extension enabled on Supabase
-- SELECT cron.schedule('settle-expired-matches', '*/5 * * * *', 'SELECT settle_expired_matches()');
-- SELECT cron.schedule('void-postponed-matches', '*/15 * * * *', 'SELECT void_old_postponed_matches()');
-- SELECT cron.schedule('recalculate-scores', '*/10 * * * *', 'SELECT recalculate_all_scores()');

-- Unschedule jobs
-- SELECT cron.unschedule('settle-expired-matches');
-- SELECT cron.unschedule('void-postponed-matches');
-- SELECT cron.unschedule('recalculate-scores');