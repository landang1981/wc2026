import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_SERVICE_KEY) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY in .env')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const TEAMS = [
  { name: 'Argentina', country_code: 'ARG', group_name: 'A', flag_emoji: '🇦🇷' },
  { name: 'Peru', country_code: 'PER', group_name: 'A', flag_emoji: '🇵🇪' },
  { name: 'Chile', country_code: 'CHI', group_name: 'A', flag_emoji: '🇨🇱' },
  { name: 'Canada', country_code: 'CAN', group_name: 'A', flag_emoji: '🇨🇦' },
  { name: 'Spain', country_code: 'ESP', group_name: 'B', flag_emoji: '🇪🇸' },
  { name: 'England', country_code: 'ENG', group_name: 'B', flag_emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { name: 'Brazil', country_code: 'BRA', group_name: 'B', flag_emoji: '🇧🇷' },
  { name: 'Honduras', country_code: 'HON', group_name: 'B', flag_emoji: '🇭🇳' },
  { name: 'France', country_code: 'FRA', group_name: 'C', flag_emoji: '🇫🇷' },
  { name: 'Germany', country_code: 'GER', group_name: 'C', flag_emoji: '🇩🇪' },
  { name: 'Japan', country_code: 'JPN', group_name: 'C', flag_emoji: '🇯🇵' },
  { name: 'Australia', country_code: 'AUS', group_name: 'C', flag_emoji: '🇦🇺' },
  { name: 'Portugal', country_code: 'POR', group_name: 'D', flag_emoji: '🇵🇹' },
  { name: 'Netherlands', country_code: 'NED', group_name: 'D', flag_emoji: '🇳🇱' },
  { name: 'Italy', country_code: 'ITA', group_name: 'D', flag_emoji: '🇮🇹' },
  { name: 'New Zealand', country_code: 'NZL', group_name: 'D', flag_emoji: '🇳🇿' },
  { name: 'Belgium', country_code: 'BEL', group_name: 'E', flag_emoji: '🇧🇪' },
  { name: 'Uruguay', country_code: 'URU', group_name: 'E', flag_emoji: '🇺🇾' },
  { name: 'Colombia', country_code: 'COL', group_name: 'E', flag_emoji: '🇨🇴' },
  { name: 'United States', country_code: 'USA', group_name: 'E', flag_emoji: '🇺🇸' },
  { name: 'Croatia', country_code: 'CRO', group_name: 'F', flag_emoji: '🇭🇷' },
  { name: 'Mexico', country_code: 'MEX', group_name: 'F', flag_emoji: '🇲🇽' },
  { name: 'Ecuador', country_code: 'ECU', group_name: 'F', flag_emoji: '🇪🇨' },
  { name: 'Jamaica', country_code: 'JAM', group_name: 'F', flag_emoji: '🇯🇲' },
  { name: 'Denmark', country_code: 'DEN', group_name: 'G', flag_emoji: '🇩🇰' },
  { name: 'Sweden', country_code: 'SWE', group_name: 'G', flag_emoji: '🇸🇪' },
  { name: 'Senegal', country_code: 'SEN', group_name: 'G', flag_emoji: '🇸🇳' },
  { name: 'Iran', country_code: 'IRN', group_name: 'G', flag_emoji: '🇮🇷' },
  { name: 'Poland', country_code: 'POL', group_name: 'H', flag_emoji: '🇵🇱' },
  { name: 'Switzerland', country_code: 'SUI', group_name: 'H', flag_emoji: '🇨🇭' },
  { name: 'Nigeria', country_code: 'NGA', group_name: 'H', flag_emoji: '🇳🇬' },
  { name: 'Cameroon', country_code: 'CMR', group_name: 'H', flag_emoji: '🇨🇲' },
  { name: 'Morocco', country_code: 'MAR', group_name: null, flag_emoji: '🇲🇦' },
  { name: 'Egypt', country_code: 'EGY', group_name: null, flag_emoji: '🇪🇬' },
  { name: 'South Korea', country_code: 'KOR', group_name: null, flag_emoji: '🇰🇷' },
  { name: 'Saudi Arabia', country_code: 'KSA', group_name: null, flag_emoji: '🇸🇦' },
  { name: 'Qatar', country_code: 'QAT', group_name: null, flag_emoji: '🇶🇦' },
  { name: 'Costa Rica', country_code: 'CRC', group_name: null, flag_emoji: '🇨🇷' },
  { name: 'Panama', country_code: 'PAN', group_name: null, flag_emoji: '🇵🇦' },
  { name: 'Ghana', country_code: 'GHA', group_name: null, flag_emoji: '🇬🇭' },
  { name: 'Algeria', country_code: 'ALG', group_name: null, flag_emoji: '🇩🇿' },
  { name: 'Tunisia', country_code: 'TUN', group_name: null, flag_emoji: '🇹🇳' },
  { name: 'Ukraine', country_code: 'UKR', group_name: null, flag_emoji: '🇺🇦' },
  { name: 'Serbia', country_code: 'SRB', group_name: null, flag_emoji: '🇷🇸' },
  { name: 'Austria', country_code: 'AUT', group_name: null, flag_emoji: '🇦🇹' },
  { name: 'Scotland', country_code: 'SCO', group_name: null, flag_emoji: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
  { name: 'Wales', country_code: 'WAL', group_name: null, flag_emoji: '🏴󠁧󠁢󠁷󠁬󠁳󠁿' },
  { name: 'Norway', country_code: 'NOR', group_name: null, flag_emoji: '🇳🇴' },
]

const GROUP_STAGE_MATCHES = [
  { home: 'ARG', away: 'CAN', datetime: '2026-06-11T22:00:00Z', venue: 'MetLife Stadium' },
  { home: 'PER', away: 'CHI', datetime: '2026-06-11T01:00:00Z', venue: 'SoFi Stadium' },
  { home: 'ESP', away: 'HON', datetime: '2026-06-12T22:00:00Z', venue: 'NRG Stadium' },
  { home: 'ENG', away: 'BRA', datetime: '2026-06-12T01:00:00Z', venue: 'Rose Bowl' },
  { home: 'FRA', away: 'AUS', datetime: '2026-06-13T22:00:00Z', venue: 'Mercedes-Benz Stadium' },
  { home: 'GER', away: 'JPN', datetime: '2026-06-13T01:00:00Z', venue: 'Arrowhead Stadium' },
  { home: 'POR', away: 'NZL', datetime: '2026-06-14T22:00:00Z', venue: 'Allegiant Stadium' },
  { home: 'ITA', away: 'NED', datetime: '2026-06-14T01:00:00Z', venue: 'AT&T Stadium' },
  { home: 'BEL', away: 'JAM', datetime: '2026-06-15T22:00:00Z', venue: 'Hard Rock Stadium' },
  { home: 'USA', away: 'COL', datetime: '2026-06-15T01:00:00Z', venue: 'Lumen Field' },
  { home: 'CRO', away: 'ECU', datetime: '2026-06-16T22:00:00Z', venue: "Levi's Stadium" },
  { home: 'MEX', away: 'URU', datetime: '2026-06-16T01:00:00Z', venue: 'State Farm Stadium' },
  { home: 'DEN', away: 'IRN', datetime: '2026-06-17T22:00:00Z', venue: 'FedExField' },
  { home: 'SEN', away: 'SWE', datetime: '2026-06-17T01:00:00Z', venue: 'Lincoln Financial Field' },
  { home: 'POL', away: 'CMR', datetime: '2026-06-18T22:00:00Z', venue: 'Gillette Stadium' },
  { home: 'SUI', away: 'NGA', datetime: '2026-06-18T01:00:00Z', venue: 'MetLife Stadium' },
  { home: 'ARG', away: 'CHI', datetime: '2026-06-19T22:00:00Z', venue: 'SoFi Stadium' },
  { home: 'CAN', away: 'PER', datetime: '2026-06-19T01:00:00Z', venue: 'NRG Stadium' },
  { home: 'BRA', away: 'ESP', datetime: '2026-06-20T22:00:00Z', venue: 'Rose Bowl' },
  { home: 'HON', away: 'ENG', datetime: '2026-06-20T01:00:00Z', venue: 'Mercedes-Benz Stadium' },
  { home: 'AUS', away: 'GER', datetime: '2026-06-21T22:00:00Z', venue: 'Arrowhead Stadium' },
  { home: 'JPN', away: 'FRA', datetime: '2026-06-21T01:00:00Z', venue: 'Allegiant Stadium' },
  { home: 'NZL', away: 'ITA', datetime: '2026-06-22T22:00:00Z', venue: 'AT&T Stadium' },
  { home: 'NED', away: 'POR', datetime: '2026-06-22T01:00:00Z', venue: 'Hard Rock Stadium' },
  { home: 'JAM', away: 'USA', datetime: '2026-06-23T22:00:00Z', venue: 'Lumen Field' },
  { home: 'COL', away: 'BEL', datetime: '2026-06-23T01:00:00Z', venue: "Levi's Stadium" },
  { home: 'ECU', away: 'MEX', datetime: '2026-06-24T22:00:00Z', venue: 'State Farm Stadium' },
  { home: 'URU', away: 'CRO', datetime: '2026-06-24T01:00:00Z', venue: 'FedExField' },
  { home: 'IRN', away: 'DEN', datetime: '2026-06-25T22:00:00Z', venue: 'Lincoln Financial Field' },
  { home: 'SWE', away: 'SEN', datetime: '2026-06-25T01:00:00Z', venue: 'Gillette Stadium' },
  { home: 'CMR', away: 'POL', datetime: '2026-06-26T22:00:00Z', venue: 'MetLife Stadium' },
  { home: 'NGA', away: 'SUI', datetime: '2026-06-26T01:00:00Z', venue: 'SoFi Stadium' },
  { home: 'ARG', away: 'PER', datetime: '2026-06-27T22:00:00Z', venue: 'NRG Stadium' },
  { home: 'CAN', away: 'CHI', datetime: '2026-06-27T01:00:00Z', venue: 'Rose Bowl' },
  { home: 'ENG', away: 'ESP', datetime: '2026-06-28T22:00:00Z', venue: 'Mercedes-Benz Stadium' },
  { home: 'BRA', away: 'HON', datetime: '2026-06-28T01:00:00Z', venue: 'Arrowhead Stadium' },
  { home: 'FRA', away: 'GER', datetime: '2026-06-29T22:00:00Z', venue: 'Allegiant Stadium' },
  { home: 'JPN', away: 'AUS', datetime: '2026-06-29T01:00:00Z', venue: 'AT&T Stadium' },
  { home: 'POR', away: 'ITA', datetime: '2026-06-30T22:00:00Z', venue: 'Hard Rock Stadium' },
  { home: 'NED', away: 'NZL', datetime: '2026-06-30T01:00:00Z', venue: 'Lumen Field' },
  { home: 'USA', away: 'BEL', datetime: '2026-07-01T22:00:00Z', venue: "Levi's Stadium" },
  { home: 'COL', away: 'JAM', datetime: '2026-07-01T01:00:00Z', venue: 'State Farm Stadium' },
  { home: 'MEX', away: 'CRO', datetime: '2026-07-02T22:00:00Z', venue: 'FedExField' },
  { home: 'ECU', away: 'URU', datetime: '2026-07-02T01:00:00Z', venue: 'Lincoln Financial Field' },
  { home: 'SEN', away: 'DEN', datetime: '2026-07-03T22:00:00Z', venue: 'Gillette Stadium' },
  { home: 'IRN', away: 'SWE', datetime: '2026-07-03T01:00:00Z', venue: 'MetLife Stadium' },
  { home: 'SUI', away: 'POL', datetime: '2026-07-04T22:00:00Z', venue: 'SoFi Stadium' },
  { home: 'NGA', away: 'CMR', datetime: '2026-07-04T01:00:00Z', venue: 'NRG Stadium' },
]

async function seed() {
  console.log('🌱 Starting seed...\n')

  console.log('📦 Seeding teams (48 teams)...')
  for (const team of TEAMS) {
    const { error } = await supabase
      .from('teams')
      .upsert(team, { onConflict: 'country_code' })
    if (error) {
      console.error(`  ❌ ${team.name}: ${error.message}`)
    }
  }
  console.log('  ✅ Teams seeded\n')

  console.log('⚽ Seeding group stage matches (48 matches)...')
  for (const m of GROUP_STAGE_MATCHES) {
    const { data: homeTeam } = await supabase
      .from('teams')
      .select('id')
      .eq('country_code', m.home)
      .single()

    const { data: awayTeam } = await supabase
      .from('teams')
      .select('id')
      .eq('country_code', m.away)
      .single()

    if (!homeTeam || !awayTeam) {
      console.error(`  ❌ ${m.home} vs ${m.away}: teams not found`)
      continue
    }

    const { error } = await supabase
      .from('matches')
      .insert({
        home_team_id: homeTeam.id,
        away_team_id: awayTeam.id,
        round_id: 'group_stage',
        match_datetime: m.datetime,
        venue: m.venue,
        status: 'SCHEDULED',
      })

    if (error) {
      console.error(`  ❌ ${m.home} vs ${m.away}: ${error.message}`)
    }
  }
  console.log('  ✅ Group stage matches seeded\n')

  console.log('✨ Seed complete!')
  console.log('📊 Visit Supabase Dashboard to verify data')
}

seed().catch(console.error)