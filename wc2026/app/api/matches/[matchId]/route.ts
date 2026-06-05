import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const { matchId } = await params
  const supabase = await getSupabaseServerClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || !['admin', 'superuser'].includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data: match, error } = await supabase
    .from('matches')
    .select(`
      id,
      match_datetime,
      venue,
      status,
      home_score,
      away_score,
      result,
      home_team:teams!matches_home_team_id_fkey(name, flag_emoji),
      away_team:teams!matches_away_team_id_fkey(name, flag_emoji),
      round:match_rounds(name)
    `)
    .eq('id', matchId)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data: match })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const { matchId } = await params
  const supabase = await getSupabaseServerClient()
  const body = await request.json()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { home_score, away_score, result, status } = body

  const { error } = await supabase
    .from('matches')
    .update({ home_score, away_score, result, status })
    .eq('id', matchId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}