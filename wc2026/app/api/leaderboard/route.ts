import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import type { LeaderboardEntry } from '@/types'

export async function GET() {
  const supabase = await getSupabaseServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Only show leaderboard with real data
  const { data: leaderboard, error } = await supabase
    .from('leaderboard')
    .select('*')
    .order('rank', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const typedData = (leaderboard || []) as LeaderboardEntry[]
  const hasRealStats = typedData.some(
    (e) => e.correct_count > 0 || e.wrong_count > 0 || e.total_penalty_points > 0
  )

  return NextResponse.json({
    updated_at: new Date().toISOString(),
    data: hasRealStats ? typedData : [],
  })
}