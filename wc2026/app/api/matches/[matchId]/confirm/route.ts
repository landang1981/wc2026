import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const { matchId } = await params
  const supabase = await getSupabaseServerClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { error } = await supabase
    .from('matches')
    .update({ status: 'CONFIRMED' })
    .eq('id', matchId)
    .eq('status', 'SCHEDULED')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  revalidatePath('/admin-panel/matches')
  revalidatePath('/matches')
  revalidatePath('/matches/' + matchId)
  revalidatePath('/leaderboard')

  return NextResponse.json({ success: true })
}