import { getSupabaseServerClient } from '@/lib/supabase/server'
import { MatchesClient } from '@/app/matches/MatchesClient'
import type { BetPrediction, MatchStatus } from '@/types'

type MatchWithRelations = {
  id: string
  match_datetime: string
  status: MatchStatus
  home_score: number | null
  away_score: number | null
  result: string | null
  round_id: string
  home_team: { name: string; flag_emoji: string | null } | null
  away_team: { name: string; flag_emoji: string | null } | null
  round: { name: string } | null
  my_bet: { prediction: BetPrediction } | null
}

function extractFirst<T>(value: T | T[] | null): T | null {
  if (Array.isArray(value)) return value.length > 0 ? value[0] ?? null : null
  return (value as T) ?? null
}

async function getMatches(): Promise<MatchWithRelations[]> {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: matches } = await supabase
    .from('matches')
    .select(`
      id,
      match_datetime,
      status,
      home_score,
      away_score,
      result,
      round_id,
      home_team:teams!matches_home_team_id_fkey(name, flag_emoji),
      away_team:teams!matches_away_team_id_fkey(name, flag_emoji),
      round:match_rounds(name)
    `)
    .order('match_datetime', { ascending: true })

  const { data: myBets } = await supabase
    .from('bets')
    .select('match_id, prediction')
    .eq('user_id', user.id)

  const SETTLED_STATUSES: MatchStatus[] = ['SETTLED', 'VOID', 'POSTPONED', 'ABANDONED']

  return (matches || [])
    // Sort: upcoming matches first (by datetime), settled matches last (by datetime desc)
    .sort((a, b) => {
      const aSettled = SETTLED_STATUSES.includes(a.status)
      const bSettled = SETTLED_STATUSES.includes(b.status)
      if (aSettled !== bSettled) return aSettled ? 1 : -1
      // Within same group, sort by datetime ascending
      return new Date(a.match_datetime).getTime() - new Date(b.match_datetime).getTime()
    })
    .map(match => {
    const myBet = myBets?.find(bet => bet.match_id === match.id) as MatchWithRelations['my_bet'] ?? null

    // For SETTLED matches where user didn't bet, show as NOT_BET
    const finalMyBet = myBet ?? (match.status === 'SETTLED' ? { prediction: 'NOT_BET' as BetPrediction } : null)

    return {
      id: match.id as string,
      match_datetime: match.match_datetime as string,
      status: match.status as MatchStatus,
      home_score: match.home_score as number | null,
      away_score: match.away_score as number | null,
      result: match.result as string | null,
      round_id: match.round_id as string,
      home_team: extractFirst<{ name: string; flag_emoji: string | null }>(match.home_team as never),
      away_team: extractFirst<{ name: string; flag_emoji: string | null }>(match.away_team as never),
      round: extractFirst<{ name: string }>(match.round as never),
      my_bet: finalMyBet,
    }
  })
}

export default async function MatchesPage() {
  const matches = await getMatches()

  return <MatchesClient initialMatches={matches} />
}
