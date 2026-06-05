import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await getSupabaseServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  const { searchParams } = new URL(request.url)
  const view = searchParams.get('view')

  if (view === 'options') {
    const [{ data: teams }, { data: rounds }] = await Promise.all([
      supabase.from('teams').select('id, name, flag_emoji').order('name'),
      supabase.from('match_rounds').select('id, name, display_order').order('display_order'),
    ])
    return NextResponse.json({ teams: teams || [], rounds: rounds || [] })
  }

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const round = searchParams.get('round')
  const status = searchParams.get('status')
  const limit = parseInt(searchParams.get('limit') || '20')
  const offset = parseInt(searchParams.get('offset') || '0')

  let query = supabase
    .from('matches')
    .select(`
      id,
      match_datetime,
      venue,
      status,
      home_score,
      away_score,
      result,
      round_id,
      home_team:teams!matches_home_team_id_fkey(id, name, country_code, flag_emoji),
      away_team:teams!matches_away_team_id_fkey(id, name, country_code, flag_emoji),
      round:match_rounds(id, name, display_order)
    `, { count: 'exact' })
    .order('match_datetime', { ascending: true })
    .range(offset, offset + limit - 1)

  if (round) {
    query = query.eq('round_id', round)
  }
  if (status) {
    query = query.eq('status', status)
  }

  const { data: matches, error, count } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const { data: myBets } = await supabase
    .from('bets')
    .select('match_id, prediction, placed_at')
    .eq('user_id', user.id)

  const matchesWithBet = matches?.map(match => ({
    ...match,
    my_bet: myBets?.find(bet => bet.match_id === match.id) || null,
  }))

  return NextResponse.json({
    data: matchesWithBet,
    count: count || 0,
    limit,
    offset,
  })
}