import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { placeBet, updateBet } from '@/lib/actions/bet.actions'

export async function POST(request: NextRequest) {
  const supabase = await getSupabaseServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { match_id, prediction } = body

  if (!match_id || !prediction) {
    return NextResponse.json({ error: 'Missing match_id or prediction' }, { status: 400 })
  }

  const result = await placeBet(match_id, prediction)
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 })

  return NextResponse.json({ success: true }, { status: 201 })
}

export async function PATCH(request: NextRequest) {
  const supabase = await getSupabaseServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { match_id, prediction } = body

  if (!match_id || !prediction) {
    return NextResponse.json({ error: 'Missing match_id or prediction' }, { status: 400 })
  }

  const result = await updateBet(match_id, prediction)
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 })

  return NextResponse.json({ success: true })
}