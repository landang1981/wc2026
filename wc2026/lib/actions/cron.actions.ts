'use server'

import { getSupabaseServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { PENALTY_POINTS } from '@/lib/constants'

export interface CronResult {
  success: boolean
  processed: number
  errors: string[]
}

export async function settlePastMatches(): Promise<CronResult> {
  const supabase = await getSupabaseServerClient()
  const errors: string[] = []

  const { data: matches, error: fetchError } = await supabase
    .from('matches')
    .select('id, match_datetime')
    .eq('status', 'SCHEDULED')
    .lt('match_datetime', new Date().toISOString())

  if (fetchError) {
    return { success: false, processed: 0, errors: [fetchError.message] }
  }

  if (!matches || matches.length === 0) {
    return { success: true, processed: 0, errors: [] }
  }

  // Use the same settle_match_result RPC for consistency
  // This handles NOT_BET insertion, penalty calculation, and score assignment
  for (const match of matches) {
    const { error: rpcError } = await supabase.rpc('settle_match_result', {
      in_match_id: match.id,
      in_home_score: 0,
      in_away_score: 0,
      in_penalty_points: PENALTY_POINTS,
    })
    if (rpcError) {
      errors.push(`Match ${match.id}: ${rpcError.message}`)
    }
  }

  revalidatePath('/admin-panel/matches')
  revalidatePath('/matches')
  revalidatePath('/leaderboard')

  return {
    success: errors.length === 0,
    processed: matches.length - errors.length,
    errors,
  }
}

export async function voidPostponedMatches(): Promise<CronResult> {
  const supabase = await getSupabaseServerClient()
  const errors: string[] = []

  const postponedThreshold = new Date()
  postponedThreshold.setHours(postponedThreshold.getHours() - 24)

  const { data: matches, error: fetchError } = await supabase
    .from('matches')
    .select('id')
    .eq('status', 'POSTPONED')
    .lt('match_datetime', postponedThreshold.toISOString())

  if (fetchError) {
    return { success: false, processed: 0, errors: [fetchError.message] }
  }

  if (!matches || matches.length === 0) {
    return { success: true, processed: 0, errors: [] }
  }

  for (const match of matches) {
    const { error: updateError } = await supabase
      .from('matches')
      .update({ status: 'VOID' })
      .eq('id', match.id)
      .eq('status', 'POSTPONED')

    if (updateError) {
      errors.push(`Match ${match.id}: ${updateError.message}`)
    }
  }

  const { error: betsError } = await supabase
    .from('bets')
    .update({ prediction: 'VOID', settled: false })
    .in('match_id', matches.map(m => m.id))
    .neq('prediction', 'VOID')

  if (betsError) {
    errors.push(`Bets update: ${betsError.message}`)
  }

  revalidatePath('/admin-panel/matches')
  revalidatePath('/matches')
  revalidatePath('/leaderboard')

  return {
    success: errors.length === 0,
    processed: matches.length,
    errors,
  }
}

export async function recalculateLeaderboard(): Promise<CronResult> {
  const supabase = await getSupabaseServerClient()
  const errors: string[] = []

  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id')

  if (profilesError) {
    return { success: false, processed: 0, errors: [profilesError.message] }
  }

  if (!profiles || profiles.length === 0) {
    return { success: true, processed: 0, errors: [] }
  }

  for (const profile of profiles) {
    const { data: bets, error: betsError } = await supabase
      .from('bets')
      .select('prediction, matches(result)')
      .eq('user_id', profile.id)
      .not('prediction', 'eq', 'VOID')

    if (betsError) {
      errors.push(`User ${profile.id} bets: ${betsError.message}`)
      continue
    }

    type BetWithMatch = { prediction: string; matches: { result: string | null } | { result: string | null }[] | null }
    const correct = bets?.filter((b: BetWithMatch) => {
      const matchResult = Array.isArray(b.matches) ? b.matches[0]?.result : b.matches?.result
      return b.prediction === matchResult
    }).length ?? 0
    const penalties = 0

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        points: correct,
        penalties,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile.id)

    if (updateError) {
      errors.push(`User ${profile.id} update: ${updateError.message}`)
    }
  }

  revalidatePath('/leaderboard')

  return {
    success: errors.length === 0,
    processed: profiles.length,
    errors,
  }
}