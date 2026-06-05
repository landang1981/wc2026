-- ============================================================
-- WC2026 Data Reset Script
-- Drops all seed data while preserving DB schema
-- Run this in Supabase SQL Editor BEFORE re-seeding
-- ============================================================

-- Order matters: delete child tables first (FK constraints)

-- 1. Delete all bets (user predictions)
DELETE FROM bets;

-- 2. Delete all matches (fixtures)
DELETE FROM matches;

-- 3. Delete all teams
DELETE FROM teams;

-- Verify cleanup
SELECT 'bets' AS table_name, COUNT(*) AS remaining FROM bets
UNION ALL
SELECT 'matches', COUNT(*) FROM matches
UNION ALL
SELECT 'teams', COUNT(*) FROM teams;
