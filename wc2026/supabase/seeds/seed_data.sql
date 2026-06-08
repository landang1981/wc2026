-- WC2026 Seed Data
-- 48 teams, 12 groups (A-L), 72 group stage matches
-- LICH THI DAU CHINH THUC THEO GIO VIET NAM (UTC+7)
-- Da chuyen doi sang UTC (UTC = Gio VN - 7)

INSERT INTO teams (name, country_code, group_name, flag_emoji) VALUES
  ('Mexico', 'MEX', 'A', '🇲🇽'),
  ('South Africa', 'RSA', 'A', '🇿🇦'),
  ('South Korea', 'KOR', 'A', '🇰🇷'),
  ('Czech Republic', 'CZE', 'A', '🇨🇿'),
  ('Canada', 'CAN', 'B', '🇨🇦'),
  ('Bosnia and Herzegovina', 'BIH', 'B', '🇧🇦'),
  ('Qatar', 'QAT', 'B', '🇶🇦'),
  ('Switzerland', 'SUI', 'B', '🇨🇭'),
  ('Brazil', 'BRA', 'C', '🇧🇷'),
  ('Morocco', 'MAR', 'C', '🇲🇦'),
  ('Haiti', 'HAI', 'C', '🇭🇹'),
  ('Scotland', 'SCO', 'C', '🏴󠁧󠁢󠁳󠁣󠁴󠁿'),
  ('United States', 'USA', 'D', '🇺🇸'),
  ('Paraguay', 'PRY', 'D', '🇵🇾'),
  ('Australia', 'AUS', 'D', '🇦🇺'),
  ('Türkiye', 'TUR', 'D', '🇹🇷'),
  ('Germany', 'GER', 'E', '🇩🇪'),
  ('Curaçao', 'CUW', 'E', '🇨🇼'),
  ('Ivory Coast', 'CIV', 'E', '🇨🇮'),
  ('Ecuador', 'ECU', 'E', '🇪🇨'),
  ('Netherlands', 'NED', 'F', '🇳🇱'),
  ('Japan', 'JPN', 'F', '🇯🇵'),
  ('Sweden', 'SWE', 'F', '🇸🇪'),
  ('Tunisia', 'TUN', 'F', '🇹🇳'),
  ('Belgium', 'BEL', 'G', '🇧🇪'),
  ('Egypt', 'EGY', 'G', '🇪🇬'),
  ('Iran', 'IRN', 'G', '🇮🇷'),
  ('New Zealand', 'NZL', 'G', '🇳🇿'),
  ('Spain', 'ESP', 'H', '🇪🇸'),
  ('Cape Verde', 'CPV', 'H', '🇨🇻'),
  ('Saudi Arabia', 'KSA', 'H', '🇸🇦'),
  ('Uruguay', 'URU', 'H', '🇺🇾'),
  ('France', 'FRA', 'I', '🇫🇷'),
  ('Senegal', 'SEN', 'I', '🇸🇳'),
  ('Iraq', 'IRQ', 'I', '🇮🇶'),
  ('Norway', 'NOR', 'I', '🇳🇴'),
  ('Argentina', 'ARG', 'J', '🇦🇷'),
  ('Algeria', 'ALG', 'J', '🇩🇿'),
  ('Austria', 'AUT', 'J', '🇦🇹'),
  ('Jordan', 'JOR', 'J', '🇯🇴'),
  ('Portugal', 'POR', 'K', '🇵🇹'),
  ('DR Congo', 'COD', 'K', '🇨🇩'),
  ('Uzbekistan', 'UZB', 'K', '🇺🇿'),
  ('Colombia', 'COL', 'K', '🇨🇴'),
  ('England', 'ENG', 'L', '🏴󠁧󠁢󠁥󠁮󠁧󠁿'),
  ('Croatia', 'CRO', 'L', '🇭🇷'),
  ('Ghana', 'GHA', 'L', '🇬🇭'),
  ('Panama', 'PAN', 'L', '🇵🇦');

-- ============================================================
-- VONG 1 (Matchday 1) - 24 tran
-- ============================================================
INSERT INTO matches (home_team_id, away_team_id, round_id, match_datetime, venue, status) VALUES
  -- 12/06 02:00 VN = 11/06 19:00 UTC
  ((SELECT id FROM teams WHERE country_code = 'MEX'), (SELECT id FROM teams WHERE country_code = 'RSA'), 'group_stage', '2026-06-11T19:00:00Z', 'Estadio Azteca, Mexico City', 'SCHEDULED'),
  -- 12/06 09:00 VN = 12/06 02:00 UTC
  ((SELECT id FROM teams WHERE country_code = 'KOR'), (SELECT id FROM teams WHERE country_code = 'CZE'), 'group_stage', '2026-06-12T02:00:00Z', 'Estadio Guadalajara', 'SCHEDULED'),

  -- 13/06 02:00 VN = 12/06 19:00 UTC
  ((SELECT id FROM teams WHERE country_code = 'CAN'), (SELECT id FROM teams WHERE country_code = 'BIH'), 'group_stage', '2026-06-12T19:00:00Z', 'BC Place, Vancouver', 'SCHEDULED'),
  -- 13/06 08:00 VN = 13/06 01:00 UTC
  ((SELECT id FROM teams WHERE country_code = 'USA'), (SELECT id FROM teams WHERE country_code = 'PRY'), 'group_stage', '2026-06-13T01:00:00Z', 'SoFi Stadium, Los Angeles', 'SCHEDULED'),

  -- 14/06 02:00 VN = 13/06 19:00 UTC
  ((SELECT id FROM teams WHERE country_code = 'QAT'), (SELECT id FROM teams WHERE country_code = 'SUI'), 'group_stage', '2026-06-13T19:00:00Z', 'Levi''s Stadium, San Francisco', 'SCHEDULED'),
  -- 14/06 05:00 VN = 13/06 22:00 UTC
  ((SELECT id FROM teams WHERE country_code = 'BRA'), (SELECT id FROM teams WHERE country_code = 'MAR'), 'group_stage', '2026-06-13T22:00:00Z', 'MetLife Stadium, New Jersey', 'SCHEDULED'),
  -- 14/06 08:00 VN = 14/06 01:00 UTC
  ((SELECT id FROM teams WHERE country_code = 'HAI'), (SELECT id FROM teams WHERE country_code = 'SCO'), 'group_stage', '2026-06-14T01:00:00Z', 'Gillette Stadium, Boston', 'SCHEDULED'),
  -- 14/06 11:00 VN = 14/06 04:00 UTC
  ((SELECT id FROM teams WHERE country_code = 'AUS'), (SELECT id FROM teams WHERE country_code = 'TUR'), 'group_stage', '2026-06-14T04:00:00Z', 'BC Place, Vancouver', 'SCHEDULED'),

  -- 15/06 00:00 VN = 14/06 17:00 UTC
  ((SELECT id FROM teams WHERE country_code = 'GER'), (SELECT id FROM teams WHERE country_code = 'CUW'), 'group_stage', '2026-06-14T17:00:00Z', 'NRG Stadium, Houston', 'SCHEDULED'),
  -- 15/06 03:00 VN = 14/06 20:00 UTC
  ((SELECT id FROM teams WHERE country_code = 'NED'), (SELECT id FROM teams WHERE country_code = 'JPN'), 'group_stage', '2026-06-14T20:00:00Z', 'AT&T Stadium, Dallas', 'SCHEDULED'),
  -- 15/06 06:00 VN = 14/06 23:00 UTC
  ((SELECT id FROM teams WHERE country_code = 'CIV'), (SELECT id FROM teams WHERE country_code = 'ECU'), 'group_stage', '2026-06-14T23:00:00Z', 'Lincoln Financial Field, Philadelphia', 'SCHEDULED'),
  -- 15/06 09:00 VN = 15/06 02:00 UTC
  ((SELECT id FROM teams WHERE country_code = 'SWE'), (SELECT id FROM teams WHERE country_code = 'TUN'), 'group_stage', '2026-06-15T02:00:00Z', 'Estadio BBVA, Monterrey', 'SCHEDULED'),

  -- 15/06 23:00 VN = 15/06 16:00 UTC
  ((SELECT id FROM teams WHERE country_code = 'ESP'), (SELECT id FROM teams WHERE country_code = 'CPV'), 'group_stage', '2026-06-15T16:00:00Z', 'Hard Rock Stadium, Miami', 'SCHEDULED'),
  -- 16/06 02:00 VN = 15/06 19:00 UTC
  ((SELECT id FROM teams WHERE country_code = 'BEL'), (SELECT id FROM teams WHERE country_code = 'EGY'), 'group_stage', '2026-06-15T19:00:00Z', 'SoFi Stadium, Los Angeles', 'SCHEDULED'),
  -- 16/06 05:00 VN = 15/06 22:00 UTC
  ((SELECT id FROM teams WHERE country_code = 'KSA'), (SELECT id FROM teams WHERE country_code = 'URU'), 'group_stage', '2026-06-15T22:00:00Z', 'Mercedes-Benz Stadium, Atlanta', 'SCHEDULED'),
  -- 16/06 08:00 VN = 16/06 01:00 UTC
  ((SELECT id FROM teams WHERE country_code = 'IRN'), (SELECT id FROM teams WHERE country_code = 'NZL'), 'group_stage', '2026-06-16T01:00:00Z', 'Lumen Field, Seattle', 'SCHEDULED'),

  -- 17/06 02:00 VN = 16/06 19:00 UTC
  ((SELECT id FROM teams WHERE country_code = 'FRA'), (SELECT id FROM teams WHERE country_code = 'SEN'), 'group_stage', '2026-06-16T19:00:00Z', 'MetLife Stadium, New Jersey', 'SCHEDULED'),
  -- 17/06 05:00 VN = 16/06 22:00 UTC
  ((SELECT id FROM teams WHERE country_code = 'IRQ'), (SELECT id FROM teams WHERE country_code = 'NOR'), 'group_stage', '2026-06-16T22:00:00Z', 'Gillette Stadium, Boston', 'SCHEDULED'),
  -- 17/06 08:00 VN = 17/06 01:00 UTC
  ((SELECT id FROM teams WHERE country_code = 'ARG'), (SELECT id FROM teams WHERE country_code = 'ALG'), 'group_stage', '2026-06-17T01:00:00Z', 'Arrowhead Stadium, Kansas City', 'SCHEDULED'),
  -- 17/06 11:00 VN = 17/06 04:00 UTC
  ((SELECT id FROM teams WHERE country_code = 'AUT'), (SELECT id FROM teams WHERE country_code = 'JOR'), 'group_stage', '2026-06-17T04:00:00Z', 'Levi''s Stadium, San Francisco', 'SCHEDULED'),

  -- 18/06 00:00 VN = 17/06 17:00 UTC
  ((SELECT id FROM teams WHERE country_code = 'POR'), (SELECT id FROM teams WHERE country_code = 'COD'), 'group_stage', '2026-06-17T17:00:00Z', 'NRG Stadium, Houston', 'SCHEDULED'),
  -- 18/06 03:00 VN = 17/06 20:00 UTC
  ((SELECT id FROM teams WHERE country_code = 'ENG'), (SELECT id FROM teams WHERE country_code = 'CRO'), 'group_stage', '2026-06-17T20:00:00Z', 'BC Place, Vancouver', 'SCHEDULED'),
  -- 18/06 06:00 VN = 17/06 23:00 UTC
  ((SELECT id FROM teams WHERE country_code = 'GHA'), (SELECT id FROM teams WHERE country_code = 'PAN'), 'group_stage', '2026-06-17T23:00:00Z', 'AT&T Stadium, Dallas', 'SCHEDULED'),
  -- 18/06 09:00 VN = 18/06 02:00 UTC
  ((SELECT id FROM teams WHERE country_code = 'UZB'), (SELECT id FROM teams WHERE country_code = 'COL'), 'group_stage', '2026-06-18T02:00:00Z', 'Estadio Azteca, Mexico City', 'SCHEDULED');

-- ============================================================
-- VONG 2 (Matchday 2) - 24 tran
-- ============================================================
INSERT INTO matches (home_team_id, away_team_id, round_id, match_datetime, venue, status) VALUES
  -- 18/06 23:00 VN = 18/06 16:00 UTC
  ((SELECT id FROM teams WHERE country_code = 'CZE'), (SELECT id FROM teams WHERE country_code = 'RSA'), 'group_stage', '2026-06-18T16:00:00Z', 'Mercedes-Benz Stadium, Atlanta', 'SCHEDULED'),
  -- 19/06 02:00 VN = 18/06 19:00 UTC
  ((SELECT id FROM teams WHERE country_code = 'SUI'), (SELECT id FROM teams WHERE country_code = 'BIH'), 'group_stage', '2026-06-18T19:00:00Z', 'SoFi Stadium, Los Angeles', 'SCHEDULED'),
  -- 19/06 05:00 VN = 18/06 22:00 UTC
  ((SELECT id FROM teams WHERE country_code = 'CAN'), (SELECT id FROM teams WHERE country_code = 'QAT'), 'group_stage', '2026-06-18T22:00:00Z', 'BC Place, Vancouver', 'SCHEDULED'),
  -- 19/06 08:00 VN = 19/06 01:00 UTC
  ((SELECT id FROM teams WHERE country_code = 'MEX'), (SELECT id FROM teams WHERE country_code = 'KOR'), 'group_stage', '2026-06-19T01:00:00Z', 'Estadio Guadalajara', 'SCHEDULED'),

  -- 20/06 02:00 VN = 19/06 19:00 UTC
  ((SELECT id FROM teams WHERE country_code = 'USA'), (SELECT id FROM teams WHERE country_code = 'AUS'), 'group_stage', '2026-06-19T19:00:00Z', 'Lumen Field, Seattle', 'SCHEDULED'),
  -- 20/06 05:00 VN = 19/06 22:00 UTC
  ((SELECT id FROM teams WHERE country_code = 'SCO'), (SELECT id FROM teams WHERE country_code = 'MAR'), 'group_stage', '2026-06-19T22:00:00Z', 'Gillette Stadium, Boston', 'SCHEDULED'),
  -- 20/06 07:30 VN = 20/06 00:30 UTC
  ((SELECT id FROM teams WHERE country_code = 'BRA'), (SELECT id FROM teams WHERE country_code = 'HAI'), 'group_stage', '2026-06-20T00:30:00Z', 'Lincoln Financial Field, Philadelphia', 'SCHEDULED'),
  -- 20/06 10:00 VN = 20/06 03:00 UTC
  ((SELECT id FROM teams WHERE country_code = 'TUR'), (SELECT id FROM teams WHERE country_code = 'PRY'), 'group_stage', '2026-06-20T03:00:00Z', 'Levi''s Stadium, San Francisco', 'SCHEDULED'),

  -- 21/06 00:00 VN = 20/06 17:00 UTC
  ((SELECT id FROM teams WHERE country_code = 'NED'), (SELECT id FROM teams WHERE country_code = 'SWE'), 'group_stage', '2026-06-20T17:00:00Z', 'NRG Stadium, Houston', 'SCHEDULED'),
  -- 21/06 03:00 VN = 20/06 20:00 UTC
  ((SELECT id FROM teams WHERE country_code = 'GER'), (SELECT id FROM teams WHERE country_code = 'CIV'), 'group_stage', '2026-06-20T20:00:00Z', 'BC Place, Vancouver', 'SCHEDULED'),
  -- 21/06 07:00 VN = 21/06 00:00 UTC
  ((SELECT id FROM teams WHERE country_code = 'ECU'), (SELECT id FROM teams WHERE country_code = 'CUW'), 'group_stage', '2026-06-21T00:00:00Z', 'Arrowhead Stadium, Kansas City', 'SCHEDULED'),
  -- 21/06 11:00 VN = 21/06 04:00 UTC
  ((SELECT id FROM teams WHERE country_code = 'TUN'), (SELECT id FROM teams WHERE country_code = 'JPN'), 'group_stage', '2026-06-21T04:00:00Z', 'Estadio BBVA, Monterrey', 'SCHEDULED'),

  -- 21/06 23:00 VN = 21/06 16:00 UTC
  ((SELECT id FROM teams WHERE country_code = 'ESP'), (SELECT id FROM teams WHERE country_code = 'KSA'), 'group_stage', '2026-06-21T16:00:00Z', 'Mercedes-Benz Stadium, Atlanta', 'SCHEDULED'),
  -- 22/06 02:00 VN = 21/06 19:00 UTC
  ((SELECT id FROM teams WHERE country_code = 'BEL'), (SELECT id FROM teams WHERE country_code = 'IRN'), 'group_stage', '2026-06-21T19:00:00Z', 'SoFi Stadium, Los Angeles', 'SCHEDULED'),
  -- 22/06 05:00 VN = 21/06 22:00 UTC
  ((SELECT id FROM teams WHERE country_code = 'URU'), (SELECT id FROM teams WHERE country_code = 'CPV'), 'group_stage', '2026-06-21T22:00:00Z', 'Hard Rock Stadium, Miami', 'SCHEDULED'),
  -- 22/06 08:00 VN = 22/06 01:00 UTC
  ((SELECT id FROM teams WHERE country_code = 'NZL'), (SELECT id FROM teams WHERE country_code = 'EGY'), 'group_stage', '2026-06-22T01:00:00Z', 'BC Place, Vancouver', 'SCHEDULED'),

  -- 23/06 00:00 VN = 22/06 17:00 UTC
  ((SELECT id FROM teams WHERE country_code = 'ARG'), (SELECT id FROM teams WHERE country_code = 'AUT'), 'group_stage', '2026-06-22T17:00:00Z', 'AT&T Stadium, Dallas', 'SCHEDULED'),
  -- 23/06 04:00 VN = 22/06 21:00 UTC
  ((SELECT id FROM teams WHERE country_code = 'FRA'), (SELECT id FROM teams WHERE country_code = 'IRQ'), 'group_stage', '2026-06-22T21:00:00Z', 'MetLife Stadium, New Jersey', 'SCHEDULED'),
  -- 23/06 07:00 VN = 23/06 00:00 UTC
  ((SELECT id FROM teams WHERE country_code = 'NOR'), (SELECT id FROM teams WHERE country_code = 'SEN'), 'group_stage', '2026-06-23T00:00:00Z', 'Lincoln Financial Field, Philadelphia', 'SCHEDULED'),
  -- 23/06 10:00 VN = 23/06 03:00 UTC
  ((SELECT id FROM teams WHERE country_code = 'JOR'), (SELECT id FROM teams WHERE country_code = 'ALG'), 'group_stage', '2026-06-23T03:00:00Z', 'Levi''s Stadium, San Francisco', 'SCHEDULED'),

  -- 24/06 00:00 VN = 23/06 17:00 UTC
  ((SELECT id FROM teams WHERE country_code = 'POR'), (SELECT id FROM teams WHERE country_code = 'UZB'), 'group_stage', '2026-06-23T17:00:00Z', 'NRG Stadium, Houston', 'SCHEDULED'),
  -- 24/06 03:00 VN = 23/06 20:00 UTC
  ((SELECT id FROM teams WHERE country_code = 'ENG'), (SELECT id FROM teams WHERE country_code = 'GHA'), 'group_stage', '2026-06-23T20:00:00Z', 'Gillette Stadium, Boston', 'SCHEDULED'),
  -- 24/06 06:00 VN = 23/06 23:00 UTC
  ((SELECT id FROM teams WHERE country_code = 'PAN'), (SELECT id FROM teams WHERE country_code = 'CRO'), 'group_stage', '2026-06-23T23:00:00Z', 'BC Place, Vancouver', 'SCHEDULED'),
  -- 24/06 09:00 VN = 24/06 02:00 UTC
  ((SELECT id FROM teams WHERE country_code = 'COL'), (SELECT id FROM teams WHERE country_code = 'COD'), 'group_stage', '2026-06-24T02:00:00Z', 'NRG Stadium, Houston', 'SCHEDULED');

-- ============================================================
-- VONG 3 (Matchday 3) - 24 tran (cung gio)
-- ============================================================
INSERT INTO matches (home_team_id, away_team_id, round_id, match_datetime, venue, status) VALUES
  -- 25/06 02:00 VN = 24/06 19:00 UTC (2 tran cung gio)
  ((SELECT id FROM teams WHERE country_code = 'BIH'), (SELECT id FROM teams WHERE country_code = 'QAT'), 'group_stage', '2026-06-24T19:00:00Z', 'Lumen Field, Seattle', 'SCHEDULED'),
  ((SELECT id FROM teams WHERE country_code = 'SUI'), (SELECT id FROM teams WHERE country_code = 'CAN'), 'group_stage', '2026-06-24T19:00:00Z', 'BC Place, Vancouver', 'SCHEDULED'),
  -- 25/06 05:00 VN = 24/06 22:00 UTC (2 tran)
  ((SELECT id FROM teams WHERE country_code = 'MAR'), (SELECT id FROM teams WHERE country_code = 'HAI'), 'group_stage', '2026-06-24T22:00:00Z', 'Mercedes-Benz Stadium, Atlanta', 'SCHEDULED'),
  ((SELECT id FROM teams WHERE country_code = 'SCO'), (SELECT id FROM teams WHERE country_code = 'BRA'), 'group_stage', '2026-06-24T22:00:00Z', 'Hard Rock Stadium, Miami', 'SCHEDULED'),
  -- 25/06 08:00 VN = 25/06 01:00 UTC (2 tran)
  ((SELECT id FROM teams WHERE country_code = 'CZE'), (SELECT id FROM teams WHERE country_code = 'MEX'), 'group_stage', '2026-06-25T01:00:00Z', 'Estadio Azteca, Mexico City', 'SCHEDULED'),
  ((SELECT id FROM teams WHERE country_code = 'RSA'), (SELECT id FROM teams WHERE country_code = 'KOR'), 'group_stage', '2026-06-25T01:00:00Z', 'Estadio BBVA, Monterrey', 'SCHEDULED'),

  -- 26/06 03:00 VN = 25/06 20:00 UTC (2 tran)
  ((SELECT id FROM teams WHERE country_code = 'CUW'), (SELECT id FROM teams WHERE country_code = 'CIV'), 'group_stage', '2026-06-25T20:00:00Z', 'MetLife Stadium, New Jersey', 'SCHEDULED'),
  ((SELECT id FROM teams WHERE country_code = 'ECU'), (SELECT id FROM teams WHERE country_code = 'GER'), 'group_stage', '2026-06-25T20:00:00Z', 'Lincoln Financial Field, Philadelphia', 'SCHEDULED'),
  -- 26/06 06:00 VN = 25/06 23:00 UTC (2 tran)
  ((SELECT id FROM teams WHERE country_code = 'JPN'), (SELECT id FROM teams WHERE country_code = 'SWE'), 'group_stage', '2026-06-25T23:00:00Z', 'NRG Stadium, Houston', 'SCHEDULED'),
  ((SELECT id FROM teams WHERE country_code = 'TUN'), (SELECT id FROM teams WHERE country_code = 'NED'), 'group_stage', '2026-06-25T23:00:00Z', 'AT&T Stadium, Dallas', 'SCHEDULED'),
  -- 26/06 09:00 VN = 26/06 02:00 UTC (2 tran)
  ((SELECT id FROM teams WHERE country_code = 'PRY'), (SELECT id FROM teams WHERE country_code = 'AUS'), 'group_stage', '2026-06-26T02:00:00Z', 'Levi''s Stadium, San Francisco', 'SCHEDULED'),
  ((SELECT id FROM teams WHERE country_code = 'TUR'), (SELECT id FROM teams WHERE country_code = 'USA'), 'group_stage', '2026-06-26T02:00:00Z', 'SoFi Stadium, Los Angeles', 'SCHEDULED'),

  -- 27/06 02:00 VN = 26/06 19:00 UTC (2 tran)
  ((SELECT id FROM teams WHERE country_code = 'NOR'), (SELECT id FROM teams WHERE country_code = 'FRA'), 'group_stage', '2026-06-26T19:00:00Z', 'Gillette Stadium, Boston', 'SCHEDULED'),
  ((SELECT id FROM teams WHERE country_code = 'SEN'), (SELECT id FROM teams WHERE country_code = 'IRQ'), 'group_stage', '2026-06-26T19:00:00Z', 'BC Place, Vancouver', 'SCHEDULED'),
  -- 27/06 07:00 VN = 27/06 00:00 UTC (2 tran)
  ((SELECT id FROM teams WHERE country_code = 'CPV'), (SELECT id FROM teams WHERE country_code = 'KSA'), 'group_stage', '2026-06-27T00:00:00Z', 'Estadio Guadalajara', 'SCHEDULED'),
  ((SELECT id FROM teams WHERE country_code = 'URU'), (SELECT id FROM teams WHERE country_code = 'ESP'), 'group_stage', '2026-06-27T00:00:00Z', 'NRG Stadium, Houston', 'SCHEDULED'),
  -- 27/06 10:00 VN = 27/06 03:00 UTC (2 tran)
  ((SELECT id FROM teams WHERE country_code = 'EGY'), (SELECT id FROM teams WHERE country_code = 'IRN'), 'group_stage', '2026-06-27T03:00:00Z', 'SoFi Stadium, Los Angeles', 'SCHEDULED'),
  ((SELECT id FROM teams WHERE country_code = 'NZL'), (SELECT id FROM teams WHERE country_code = 'BEL'), 'group_stage', '2026-06-27T03:00:00Z', 'Lumen Field, Seattle', 'SCHEDULED'),

  -- 28/06 04:00 VN = 27/06 21:00 UTC (2 tran)
  ((SELECT id FROM teams WHERE country_code = 'CRO'), (SELECT id FROM teams WHERE country_code = 'GHA'), 'group_stage', '2026-06-27T21:00:00Z', 'Lincoln Financial Field, Philadelphia', 'SCHEDULED'),
  ((SELECT id FROM teams WHERE country_code = 'PAN'), (SELECT id FROM teams WHERE country_code = 'ENG'), 'group_stage', '2026-06-27T21:00:00Z', 'MetLife Stadium, New Jersey', 'SCHEDULED'),
  -- 28/06 06:30 VN = 27/06 23:30 UTC (2 tran)
  ((SELECT id FROM teams WHERE country_code = 'COL'), (SELECT id FROM teams WHERE country_code = 'POR'), 'group_stage', '2026-06-27T23:30:00Z', 'Hard Rock Stadium, Miami', 'SCHEDULED'),
  ((SELECT id FROM teams WHERE country_code = 'COD'), (SELECT id FROM teams WHERE country_code = 'UZB'), 'group_stage', '2026-06-27T23:30:00Z', 'Mercedes-Benz Stadium, Atlanta', 'SCHEDULED'),
  -- 28/06 09:00 VN = 28/06 02:00 UTC (2 tran)
  ((SELECT id FROM teams WHERE country_code = 'ALG'), (SELECT id FROM teams WHERE country_code = 'AUT'), 'group_stage', '2026-06-28T02:00:00Z', 'AT&T Stadium, Dallas', 'SCHEDULED'),
  ((SELECT id FROM teams WHERE country_code = 'JOR'), (SELECT id FROM teams WHERE country_code = 'ARG'), 'group_stage', '2026-06-28T02:00:00Z', 'Arrowhead Stadium, Kansas City', 'SCHEDULED');

SELECT COUNT(*) AS total_teams FROM teams;
SELECT COUNT(*) AS total_matches FROM matches;
