'use server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { BetPrediction } from '@/types'

async function getAuthClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component
          }
        },
      },
    }
  )
}

export async function placeBet(matchId: string, prediction: BetPrediction): Promise<{ error?: string }> {
  const supabase = await getAuthClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: 'Unauthorized' }

  const { data: match } = await supabase
    .from('matches')
    .select('id, status, match_datetime')
    .eq('id', matchId)
    .single()

  if (!match) return { error: 'Match not found' }
  if (match.status !== 'SCHEDULED') return { error: 'Betting is closed for this match' }
  if (new Date(match.match_datetime) <= new Date()) return { error: 'Match has already started' }

  const { error: insertError } = await supabase
    .from('bets')
    .insert({
      user_id: user.id,
      match_id: matchId,
      prediction,
    })

  if (insertError) {
    if (insertError.code === '23505') return { error: 'You already placed a bet for this match' }
    return { error: insertError.message }
  }

  return {}
}

export async function updateBet(matchId: string, prediction: BetPrediction): Promise<{ error?: string }> {
  const supabase = await getAuthClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: 'Unauthorized' }

  const { data: match } = await supabase
    .from('matches')
    .select('id, status, match_datetime')
    .eq('id', matchId)
    .single()

  if (!match) return { error: 'Match not found' }
  if (match.status !== 'SCHEDULED') return { error: 'Betting is closed for this match' }
  if (new Date(match.match_datetime) <= new Date()) return { error: 'Match has already started' }

  const { error: updateError } = await supabase
    .from('bets')
    .update({ prediction })
    .eq('user_id', user.id)
    .eq('match_id', matchId)

  if (updateError) return { error: updateError.message }
  return {}
}