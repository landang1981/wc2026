import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { PENALTY_POINTS } from '@/lib/constants'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const { matchId } = await params
  const supabase = await getSupabaseServerClient()
  const body = await request.json()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || !['admin', 'superuser'].includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { home_score, away_score } = body

  if (typeof home_score !== 'number' || typeof away_score !== 'number') {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  // Call the RPC function (handles both settle and re-settle)
  const { data, error } = await supabase.rpc('settle_match_result', {
    in_away_score: away_score,
    in_home_score: home_score,
    in_match_id: matchId,
    in_penalty_points: PENALTY_POINTS,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  revalidatePath('/admin-panel/matches')
  revalidatePath('/matches')
  revalidatePath('/matches/' + matchId)
  revalidatePath('/leaderboard')

  return NextResponse.json(data)
}