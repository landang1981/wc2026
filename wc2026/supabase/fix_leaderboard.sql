-- ==========================================
-- Fix leaderboard view to show all players
-- ==========================================

DROP VIEW IF EXISTS leaderboard;

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
