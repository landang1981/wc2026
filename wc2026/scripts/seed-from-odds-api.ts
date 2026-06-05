import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const ODDS_API_KEY = process.env.ODDS_API_KEY!
const ODDS_API_BASE_URL = process.env.ODDS_API_BASE_URL || 'https://api.the-odds-api.com/v4'
const ODDS_API_SPORT_KEY = process.env.ODDS_API_SPORT_KEY || 'soccer_fifa_world_cup'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const WC2026_TEAMS = [
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

async function seedTeams() {
  console.log('Seeding teams...')
  const results = []
  for (const team of WC2026_TEAMS) {
    const { data, error } = await supabase
      .from('teams')
      .upsert(team, { onConflict: 'country_code' })
      .select()
      .single()
    if (error) {
      console.error(`Error seeding ${team.name}:`, error.message)
    } else {
      results.push(data)
    }
  }
  console.log(`Seeded ${results.length} teams`)
  return results
}

interface OddsApiMatch {
  id: string
  sport_key: string
  sport_title: string
  commence_time: string
  home_team: string
  away_team: string
  bookmakers?: Array<{
    key: string
    title: string
    markets: Array<{
      key: string
      outcomes: Array<{
        name: string
        price: number
        point?: number
      }>
    }>
  }>
}

async function fetchOddsApiMatches(): Promise<OddsApiMatch[]> {
  console.log('Fetching matches from The Odds API...')
  try {
    const regions = 'us'
    const markets = 'h2h'
    const url = `${ODDS_API_BASE_URL}/sports/${ODDS_API_SPORT_KEY}/odds?apiKey=${ODDS_API_KEY}&regions=${regions}&markets=${markets}`

    const response = await fetch(url)
    if (!response.ok) {
      const text = await response.text()
      throw new Error(`API returned ${response.status}: ${text}`)
    }
    const data: OddsApiMatch[] = await response.json()
    console.log(`Fetched ${data.length} matches from API`)
    return data
  } catch (error) {
    console.error('Error fetching from Odds API:', error)
    return []
  }
}

function teamNameToCountryCode(name: string): string | null {
  const map: Record<string, string> = {
    'Argentina': 'ARG', 'Peru': 'PER', 'Chile': 'CHI', 'Canada': 'CAN',
    'Spain': 'ESP', 'England': 'ENG', 'Brazil': 'BRA', 'Honduras': 'HON',
    'France': 'FRA', 'Germany': 'GER', 'Japan': 'JPN', 'Australia': 'AUS',
    'Portugal': 'POR', 'Netherlands': 'NED', 'Italy': 'ITA', 'New Zealand': 'NZL',
    'Belgium': 'BEL', 'Uruguay': 'URU', 'Colombia': 'COL', 'United States': 'USA',
    'Croatia': 'CRO', 'Mexico': 'MEX', 'Ecuador': 'ECU', 'Jamaica': 'JAM',
    'Denmark': 'DEN', 'Sweden': 'SWE', 'Senegal': 'SEN', 'Iran': 'IRN',
    'Poland': 'POL', 'Switzerland': 'SUI', 'Nigeria': 'NGA', 'Cameroon': 'CMR',
    'Morocco': 'MAR', 'Egypt': 'EGY', 'South Korea': 'KOR', 'Saudi Arabia': 'KSA',
    'Qatar': 'QAT', 'Costa Rica': 'CRC', 'Panama': 'PAN', 'Ghana': 'GHA',
    'Algeria': 'ALG', 'Tunisia': 'TUN', 'Ukraine': 'UKR', 'Serbia': 'SRB',
    'Austria': 'AUT', 'Scotland': 'SCO', 'Wales': 'WAL', 'Norway': 'NOR',
  }
  return map[name] || null
}

async function seedMatchesFromOddsAPI() {
  console.log('Seeding matches from Odds API...')
  const oddsMatches = await fetchOddsApiMatches()

  if (oddsMatches.length === 0) {
    console.log('No matches from API, using fallback schedule')
    await seedFallbackMatches()
    return
  }

  let seeded = 0
  for (const om of oddsMatches) {
    const homeCode = teamNameToCountryCode(om.home_team)
    const awayCode = teamNameToCountryCode(om.away_team)

    if (!homeCode || !awayCode) {
      console.log(`Skipping unknown teams: ${om.home_team} vs ${om.away_team}`)
      continue
    }

    const { data: homeTeam } = await supabase
      .from('teams')
      .select('id')
      .eq('country_code', homeCode)
      .single()

    const { data: awayTeam } = await supabase
      .from('teams')
      .select('id')
      .eq('country_code', awayCode)
      .single()

    if (!homeTeam || !awayTeam) {
      console.log(`Could not find teams for ${om.home_team} vs ${om.away_team}`)
      continue
    }

    const matchDatetime = new Date(om.commence_time).toISOString()

    const { error } = await supabase
      .from('matches')
      .upsert({
        home_team_id: homeTeam.id,
        away_team_id: awayTeam.id,
        round_id: 'group_stage',
        match_datetime: matchDatetime,
        external_match_id: om.id,
        status: 'SCHEDULED',
      }, { onConflict: 'external_match_id' })

    if (error) {
      console.log(`Error seeding match ${om.home_team} vs ${om.away_team}:`, error.message)
    } else {
      seeded++
    }
  }
  console.log(`Seeded ${seeded} matches from Odds API`)
}

async function seedFallbackMatches() {
  console.log('Seeding fallback group stage matches...')

  const groupStageMatches = [
    { home: 'ARG', away: 'CAN', datetime: '2026-06-11T22:00:00Z', venue: 'MetLife Stadium' },
    { home: 'PER', away: 'CHI', datetime: '2026-06-12T01:00:00Z', venue: 'SoFi Stadium' },
    { home: 'ESP', away: 'HOND', datetime: '2026-06-12T22:00:00Z', venue: 'NRG Stadium' },
    { home: 'ENG', away: 'BRA', datetime: '2026-06-13T01:00:00Z', venue: 'Rose Bowl' },
    { home: 'FRA', away: 'AUS', datetime: '2026-06-13T22:00:00Z', venue: 'Mercedes-Benz Stadium' },
    { home: 'GER', away: 'JPN', datetime: '2026-06-14T01:00:00Z', venue: 'Arrowhead Stadium' },
    { home: 'POR', away: 'NZL', datetime: '2026-06-14T22:00:00Z', venue: 'Allegiant Stadium' },
    { home: 'ITA', away: 'NED', datetime: '2026-06-15T01:00:00Z', venue: 'AT&T Stadium' },
    { home: 'BEL', away: 'JAM', datetime: '2026-06-15T22:00:00Z', venue: 'Hard Rock Stadium' },
    { home: 'USA', away: 'COL', datetime: '2026-06-16T01:00:00Z', venue: 'Lumen Field' },
    { home: 'CRO', away: 'ECU', datetime: '2026-06-16T22:00:00Z', venue: "Levi's Stadium" },
    { home: 'MEX', away: 'URU', datetime: '2026-06-17T01:00:00Z', venue: 'State Farm Stadium' },
    { home: 'DEN', away: 'IRN', datetime: '2026-06-17T22:00:00Z', venue: 'FedExField' },
    { home: 'SEN', away: 'SWE', datetime: '2026-06-18T01:00:00Z', venue: 'Lincoln Financial Field' },
    { home: 'POL', away: 'CMR', datetime: '2026-06-18T22:00:00Z', venue: 'Gillette Stadium' },
    { home: 'SUI', away: 'NGA', datetime: '2026-06-19T01:00:00Z', venue: 'Wembley Stadium' },
  ]

  let seeded = 0
  for (const m of groupStageMatches) {
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
      console.log(`Could not find teams for ${m.home} vs ${m.away}`)
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
      console.log(`Error seeding ${m.home} vs ${m.away}:`, error.message)
    } else {
      seeded++
    }
  }
  console.log(`Seeded ${seeded} fallback matches`)
}

async function main() {
  console.log('Starting seed process...')
  console.log(`Supabase: ${SUPABASE_URL}`)

  if (!SUPABASE_SERVICE_KEY) {
    console.error('Missing SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  await seedTeams()
  await seedMatchesFromOddsAPI()

  console.log('Seed complete!')
}

main().catch(console.error)