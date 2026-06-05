// WC2026 Seed Generator - exact schedule provided
// Run: npx tsx scripts/generate-seed.ts

import * as fs from 'fs'
import * as path from 'path'

// ============================================================
// Teams - 48 teams, 12 groups
// ============================================================
const GROUPS: Record<string, Array<{ name: string; code: string; flag: string }>> = {
  A: [
    { name: 'Mexico',             code: 'MEX', flag: '🇲🇽' },
    { name: 'South Africa',       code: 'RSA', flag: '🇿🇦' },
    { name: 'South Korea',        code: 'KOR', flag: '🇰🇷' },
    { name: 'Czech Republic',     code: 'CZE', flag: '🇨🇿' },
  ],
  B: [
    { name: 'Canada',                code: 'CAN', flag: '🇨🇦' },
    { name: 'Bosnia and Herzegovina', code: 'BIH', flag: '🇧🇦' },
    { name: 'Qatar',                 code: 'QAT', flag: '🇶🇦' },
    { name: 'Switzerland',           code: 'SUI', flag: '🇨🇭' },
  ],
  C: [
    { name: 'Brazil',      code: 'BRA', flag: '🇧🇷' },
    { name: 'Morocco',     code: 'MAR', flag: '🇲🇦' },
    { name: 'Haiti',       code: 'HAI', flag: '🇭🇹' },
    { name: 'Scotland',    code: 'SCO', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
  ],
  D: [
    { name: 'United States', code: 'USA', flag: '🇺🇸' },
    { name: 'Paraguay',      code: 'PRY', flag: '🇵🇾' },
    { name: 'Australia',     code: 'AUS', flag: '🇦🇺' },
    { name: 'Türkiye',       code: 'TUR', flag: '🇹🇷' },
  ],
  E: [
    { name: 'Germany',     code: 'GER', flag: '🇩🇪' },
    { name: 'Curaçao',     code: 'CUW', flag: '🇨🇼' },
    { name: 'Ivory Coast', code: 'CIV', flag: '🇨🇮' },
    { name: 'Ecuador',     code: 'ECU', flag: '🇪🇨' },
  ],
  F: [
    { name: 'Netherlands', code: 'NED', flag: '🇳🇱' },
    { name: 'Japan',       code: 'JPN', flag: '🇯🇵' },
    { name: 'Sweden',      code: 'SWE', flag: '🇸🇪' },
    { name: 'Tunisia',     code: 'TUN', flag: '🇹🇳' },
  ],
  G: [
    { name: 'Belgium',    code: 'BEL', flag: '🇧🇪' },
    { name: 'Egypt',      code: 'EGY', flag: '🇪🇬' },
    { name: 'Iran',       code: 'IRN', flag: '🇮🇷' },
    { name: 'New Zealand', code: 'NZL', flag: '🇳🇿' },
  ],
  H: [
    { name: 'Spain',        code: 'ESP', flag: '🇪🇸' },
    { name: 'Cape Verde',   code: 'CPV', flag: '🇨🇻' },
    { name: 'Saudi Arabia', code: 'KSA', flag: '🇸🇦' },
    { name: 'Uruguay',      code: 'URU', flag: '🇺🇾' },
  ],
  I: [
    { name: 'France',   code: 'FRA', flag: '🇫🇷' },
    { name: 'Senegal',  code: 'SEN', flag: '🇸🇳' },
    { name: 'Iraq',     code: 'IRQ', flag: '🇮🇶' },
    { name: 'Norway',   code: 'NOR', flag: '🇳🇴' },
  ],
  J: [
    { name: 'Argentina', code: 'ARG', flag: '🇦🇷' },
    { name: 'Algeria',   code: 'ALG', flag: '🇩🇿' },
    { name: 'Austria',   code: 'AUT', flag: '🇦🇹' },
    { name: 'Jordan',    code: 'JOR', flag: '🇯🇴' },
  ],
  K: [
    { name: 'Portugal',   code: 'POR', flag: '🇵🇹' },
    { name: 'DR Congo',   code: 'COD', flag: '🇨🇩' },
    { name: 'Uzbekistan', code: 'UZB', flag: '🇺🇿' },
    { name: 'Colombia',   code: 'COL', flag: '🇨🇴' },
  ],
  L: [
    { name: 'England', code: 'ENG', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    { name: 'Croatia', code: 'CRO', flag: '🇭🇷' },
    { name: 'Ghana',   code: 'GHA', flag: '🇬🇭' },
    { name: 'Panama',  code: 'PAN', flag: '🇵🇦' },
  ],
}

// ============================================================
// Exact schedule provided
// ============================================================
interface MatchEntry {
  date: string       // DD/MM/YYYY
  homeCode: string
  awayCode: string
  time: string       // HH:mm local time
  venue: string
}

const SCHEDULE: MatchEntry[] = [
  // Ngay 11/06/2026
  { date: '11/06/2026', homeCode: 'MEX', awayCode: 'RSA', time: '19:00', venue: 'Mexico City Stadium' },
  { date: '11/06/2026', homeCode: 'KOR', awayCode: 'CZE', time: '22:00', venue: 'Estadio Guadalajara' },

  // Ngay 12/06/2026
  { date: '12/06/2026', homeCode: 'CAN', awayCode: 'BIH', time: '02:00', venue: 'Toronto Stadium' },
  { date: '12/06/2026', homeCode: 'USA', awayCode: 'PRY', time: '05:00', venue: 'Los Angeles Stadium' },
  { date: '12/06/2026', homeCode: 'BRA', awayCode: 'MAR', time: '10:00', venue: 'New York/New Jersey Stadium' },

  // Ngay 13/06/2026
  { date: '13/06/2026', homeCode: 'HAI', awayCode: 'SCO', time: '01:00', venue: 'Boston Stadium' },
  { date: '13/06/2026', homeCode: 'AUS', awayCode: 'TUR', time: '04:00', venue: 'BC Place Vancouver' },
  { date: '13/06/2026', homeCode: 'QAT', awayCode: 'SUI', time: '19:00', venue: 'San Francisco Bay Area Stadium' },

  // Ngay 14/06/2026
  { date: '14/06/2026', homeCode: 'GER', awayCode: 'CUW', time: '00:00', venue: 'Houston Stadium' },
  { date: '14/06/2026', homeCode: 'NED', awayCode: 'JPN', time: '03:00', venue: 'Dallas Stadium' },
  { date: '14/06/2026', homeCode: 'CIV', awayCode: 'ECU', time: '06:00', venue: 'Philadelphia Stadium' },
  { date: '14/06/2026', homeCode: 'SWE', awayCode: 'TUN', time: '09:00', venue: 'Estadio Monterrey' },
  { date: '14/06/2026', homeCode: 'ESP', awayCode: 'CPV', time: '23:00', venue: 'Miami Stadium' },

  // Ngay 15/06/2026
  { date: '15/06/2026', homeCode: 'KSA', awayCode: 'URU', time: '02:00', venue: 'Atlanta Stadium' },
  { date: '15/06/2026', homeCode: 'BEL', awayCode: 'EGY', time: '05:00', venue: 'Los Angeles Stadium' },
  { date: '15/06/2026', homeCode: 'IRN', awayCode: 'NZL', time: '08:00', venue: 'Seattle Stadium' },
  { date: '15/06/2026', homeCode: 'FRA', awayCode: 'SEN', time: '22:00', venue: 'New York/New Jersey Stadium' },

  // Ngay 16/06/2026
  { date: '16/06/2026', homeCode: 'IRQ', awayCode: 'NOR', time: '01:00', venue: 'Boston Stadium' },
  { date: '16/06/2026', homeCode: 'ARG', awayCode: 'ALG', time: '04:00', venue: 'Kansas City Stadium' },
  { date: '16/06/2026', homeCode: 'AUT', awayCode: 'JOR', time: '19:00', venue: 'San Francisco Bay Area Stadium' },
  { date: '16/06/2026', homeCode: 'ENG', awayCode: 'CRO', time: '22:00', venue: 'Toronto Stadium' },

  // Ngay 17/06/2026
  { date: '17/06/2026', homeCode: 'GHA', awayCode: 'PAN', time: '01:00', venue: 'Dallas Stadium' },
  { date: '17/06/2026', homeCode: 'POR', awayCode: 'COD', time: '04:00', venue: 'Houston Stadium' },
  { date: '17/06/2026', homeCode: 'UZB', awayCode: 'COL', time: '10:00', venue: 'Mexico City Stadium' },
  { date: '17/06/2026', homeCode: 'CZE', awayCode: 'RSA', time: '22:00', venue: 'Atlanta Stadium' },

  // Ngay 18/06/2026
  { date: '18/06/2026', homeCode: 'SUI', awayCode: 'BIH', time: '01:00', venue: 'Los Angeles Stadium' },
  { date: '18/06/2026', homeCode: 'CAN', awayCode: 'QAT', time: '04:00', venue: 'BC Place Vancouver' },
  { date: '18/06/2026', homeCode: 'MEX', awayCode: 'KOR', time: '19:00', venue: 'Estadio Guadalajara' },

  // Ngay 19/06/2026
  { date: '19/06/2026', homeCode: 'BRA', awayCode: 'HAI', time: '00:30', venue: 'Philadelphia Stadium' },
  { date: '19/06/2026', homeCode: 'SCO', awayCode: 'MAR', time: '05:00', venue: 'Boston Stadium' },
  { date: '19/06/2026', homeCode: 'USA', awayCode: 'AUS', time: '19:00', venue: 'Seattle Stadium' },
  { date: '19/06/2026', homeCode: 'TUR', awayCode: 'PRY', time: '22:00', venue: 'San Francisco Bay Area Stadium' },

  // Ngay 20/06/2026
  { date: '20/06/2026', homeCode: 'NED', awayCode: 'SWE', time: '01:00', venue: 'Houston Stadium' },
  { date: '20/06/2026', homeCode: 'GER', awayCode: 'CIV', time: '04:00', venue: 'Toronto Stadium' },
  { date: '20/06/2026', homeCode: 'ECU', awayCode: 'CUW', time: '10:00', venue: 'Kansas City Stadium' },
  { date: '20/06/2026', homeCode: 'TUN', awayCode: 'JPN', time: '23:00', venue: 'Estadio Monterrey' },

  // Ngay 21/06/2026
  { date: '21/06/2026', homeCode: 'ESP', awayCode: 'KSA', time: '02:00', venue: 'Atlanta Stadium' },
  { date: '21/06/2026', homeCode: 'URU', awayCode: 'CPV', time: '05:00', venue: 'Miami Stadium' },
  { date: '21/06/2026', homeCode: 'BEL', awayCode: 'IRN', time: '10:00', venue: 'Los Angeles Stadium' },
  { date: '21/06/2026', homeCode: 'NZL', awayCode: 'EGY', time: '23:00', venue: 'BC Place Vancouver' },

  // Ngay 22/06/2026
  { date: '22/06/2026', homeCode: 'FRA', awayCode: 'IRQ', time: '02:00', venue: 'New York/New Jersey Stadium' },
  { date: '22/06/2026', homeCode: 'NOR', awayCode: 'SEN', time: '05:00', venue: 'Philadelphia Stadium' },
  { date: '22/06/2026', homeCode: 'ARG', awayCode: 'AUT', time: '19:00', venue: 'Dallas Stadium' },
  { date: '22/06/2026', homeCode: 'JOR', awayCode: 'ALG', time: '22:00', venue: 'San Francisco Bay Area Stadium' },

  // Ngay 23/06/2026
  { date: '23/06/2026', homeCode: 'POR', awayCode: 'UZB', time: '01:00', venue: 'Houston Stadium' },
  { date: '23/06/2026', homeCode: 'ENG', awayCode: 'GHA', time: '04:00', venue: 'Boston Stadium' },
  { date: '23/06/2026', homeCode: 'PAN', awayCode: 'CRO', time: '08:00', venue: 'Toronto Stadium' },
  { date: '23/06/2026', homeCode: 'COL', awayCode: 'COD', time: '23:00', venue: 'Houston Stadium' },

  // Ngay 24/06/2026
  { date: '24/06/2026', homeCode: 'SCO', awayCode: 'BRA', time: '02:00', venue: 'Miami Stadium' },
  { date: '24/06/2026', homeCode: 'MAR', awayCode: 'HAI', time: '05:00', venue: 'Atlanta Stadium' },
  { date: '24/06/2026', homeCode: 'CAN', awayCode: 'SUI', time: '19:00', venue: 'Vancouver Stadium' },
  { date: '24/06/2026', homeCode: 'BIH', awayCode: 'QAT', time: '22:00', venue: 'Seattle Stadium' },

  // Ngay 25/06/2026
  { date: '25/06/2026', homeCode: 'MEX', awayCode: 'CZE', time: '01:00', venue: 'Mexico City Stadium' },
  { date: '25/06/2026', homeCode: 'KOR', awayCode: 'RSA', time: '04:00', venue: 'Estadio Monterrey' },
  { date: '25/06/2026', homeCode: 'ECU', awayCode: 'GER', time: '10:00', venue: 'Philadelphia Stadium' },
  { date: '25/06/2026', homeCode: 'CUW', awayCode: 'CIV', time: '23:00', venue: 'New York/New Jersey Stadium' },

  // Ngay 26/06/2026
  { date: '26/06/2026', homeCode: 'TUN', awayCode: 'NED', time: '02:00', venue: 'Dallas Stadium' },
  { date: '26/06/2026', homeCode: 'JPN', awayCode: 'SWE', time: '05:00', venue: 'Houston Stadium' },
  { date: '26/06/2026', homeCode: 'USA', awayCode: 'TUR', time: '10:00', venue: 'Los Angeles Stadium' },
  { date: '26/06/2026', homeCode: 'PRY', awayCode: 'AUS', time: '23:00', venue: 'San Francisco Bay Area Stadium' },

  // Ngay 27/06/2026
  { date: '27/06/2026', homeCode: 'NOR', awayCode: 'FRA', time: '02:00', venue: 'Boston Stadium' },
  { date: '27/06/2026', homeCode: 'SEN', awayCode: 'IRQ', time: '05:00', venue: 'Toronto Stadium' },
  { date: '27/06/2026', homeCode: 'NZL', awayCode: 'BEL', time: '10:00', venue: 'Seattle Stadium' },
  { date: '27/06/2026', homeCode: 'EGY', awayCode: 'IRN', time: '23:00', venue: 'Los Angeles Stadium' },

  // Ngay 28/06/2026
  { date: '28/06/2026', homeCode: 'URU', awayCode: 'ESP', time: '02:00', venue: 'Houston Stadium' },
  { date: '28/06/2026', homeCode: 'CPV', awayCode: 'KSA', time: '05:00', venue: 'Guadalajara Stadium' },
  { date: '28/06/2026', homeCode: 'PAN', awayCode: 'ENG', time: '10:00', venue: 'New York/New Jersey Stadium' },
  { date: '28/06/2026', homeCode: 'CRO', awayCode: 'GHA', time: '23:00', venue: 'Philadelphia Stadium' },

  // Ngay 29/06/2026
  { date: '29/06/2026', homeCode: 'JOR', awayCode: 'ARG', time: '02:00', venue: 'Kansas City Stadium' },
  { date: '29/06/2026', homeCode: 'ALG', awayCode: 'AUT', time: '05:00', venue: 'Dallas Stadium' },
  { date: '29/06/2026', homeCode: 'COL', awayCode: 'POR', time: '10:00', venue: 'Miami Stadium' },
  { date: '29/06/2026', homeCode: 'COD', awayCode: 'UZB', time: '23:00', venue: 'Atlanta Stadium' },
]

// ============================================================
// Generate SQL
// ============================================================
function esc(s: string): string {
  return s.replace(/'/g, "''")
}

function parseDateTime(dateStr: string, timeStr: string): string {
  // dateStr: DD/MM/YYYY, timeStr: HH:mm
  const parts = dateStr.split('/')
  const d = parts[0]
  const m = parts[1]
  const y = parts[2]
  // Assume local times are in UTC-5 (EST/CDT) for simplicity
  // Convert to UTC ISO string
  const hour = parseInt(timeStr.split(':')[0])
  const min = timeStr.split(':')[1]
  // Add 5 hours to convert to UTC (assuming local is UTC-5)
  let utcHour = hour + 5
  let day = parseInt(d)
  // Handle day overflow
  if (utcHour >= 24) {
    utcHour -= 24
    day += 1
  }
  return y + '-' + m + '-' + day.toString().padStart(2, '0') + 'T' + utcHour.toString().padStart(2, '0') + ':' + min + ':00Z'
}

function generateSQL(): string {
  let sql = '-- WC2026 Seed Data\n'
  sql += '-- 48 teams, 12 groups (A-L), ' + SCHEDULE.length + ' group stage matches\n\n'

  // Teams
  sql += 'INSERT INTO teams (name, country_code, group_name, flag_emoji) VALUES\n'
  const teamRows: string[] = []
  for (const g of Object.keys(GROUPS)) {
    for (const t of GROUPS[g]) {
      teamRows.push("  ('" + esc(t.name) + "', '" + t.code + "', '" + g + "', '" + t.flag + "')")
    }
  }
  sql += teamRows.join(',\n') + ';\n\n'

  // Matches
  sql += 'INSERT INTO matches (home_team_id, away_team_id, round_id, match_datetime, venue, status) VALUES\n'
  const matchRows = SCHEDULE.map(m => {
    const dt = parseDateTime(m.date, m.time)
    return "  ((SELECT id FROM teams WHERE country_code = '" + m.homeCode + "'), (SELECT id FROM teams WHERE country_code = '" + m.awayCode + "'), 'group_stage', '" + dt + "', '" + esc(m.venue) + "', 'SCHEDULED')"
  })
  sql += matchRows.join(',\n') + ';\n\n'

  sql += "SELECT COUNT(*) AS total_teams FROM teams;\nSELECT COUNT(*) AS total_matches FROM matches;\n"

  return sql
}

function main() {
  const sql = generateSQL()
  const outDir = path.join(__dirname, '..', 'supabase', 'seeds')
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })
  fs.writeFileSync(path.join(outDir, 'seed_data.sql'), sql, 'utf-8')

  console.log('Done: supabase/seeds/seed_data.sql')
  console.log('  Teams:  ' + Object.keys(GROUPS).length * 4)
  console.log('  Matches: ' + SCHEDULE.length)
}

main()
