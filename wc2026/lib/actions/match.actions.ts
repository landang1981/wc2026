'use server'

import { getSupabaseServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { PENALTY_POINTS } from '@/lib/constants'

export interface CreateMatchInput {
  homeTeamId: string
  awayTeamId: string
  matchDatetime: string
  roundId: string
  venue?: string
}

export interface CreateMatchResult {
  success: boolean
  error?: string
  matchId?: string
}

export async function createMatch(input: CreateMatchInput): Promise<CreateMatchResult> {
  const supabase = await getSupabaseServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return { success: false, error: 'Only admin can create matches' }
  }

  const { data, error } = await supabase
    .from('matches')
    .insert({
      home_team_id: input.homeTeamId,
      away_team_id: input.awayTeamId,
      match_datetime: input.matchDatetime,
      round_id: input.roundId,
      venue: input.venue,
      status: 'SCHEDULED',
    })
    .select('id')
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/matches')
  return { success: true, matchId: data.id }
}

export interface SettleMatchResult {
  success: boolean
  error?: string
}

export async function settleMatch(
  matchId: string,
  homeScore: number,
  awayScore: number,
  _result: 'HOME_WIN' | 'AWAY_WIN' | 'DRAW'
): Promise<SettleMatchResult> {
  const supabase = await getSupabaseServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['admin', 'superuser'].includes(profile.role)) {
    return { success: false, error: 'Only admin or superuser can settle matches' }
  }

  // Call the RPC function which handles both settle and re-settle + recalculates bets
  const { data, error } = await supabase.rpc('settle_match_result', {
    in_away_score: awayScore,
    in_home_score: homeScore,
    in_match_id: matchId,
    in_penalty_points: PENALTY_POINTS,
  })

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/matches')
  revalidatePath('/matches')
  revalidatePath('/matches/' + matchId)
  revalidatePath('/leaderboard')
  return { success: true }
}

export interface ConfirmMatchResult {
  success: boolean
  error?: string
}

export async function confirmMatch(matchId: string): Promise<ConfirmMatchResult> {
  const supabase = await getSupabaseServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return { success: false, error: 'Only admin can confirm matches' }
  }

  const { error } = await supabase
    .from('matches')
    .update({ status: 'CONFIRMED' })
    .eq('id', matchId)
    .eq('status', 'SCHEDULED')

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/matches')
  return { success: true }
}

export interface VoidMatchResult {
  success: boolean
  error?: string
}

export async function voidMatch(matchId: string): Promise<VoidMatchResult> {
  const supabase = await getSupabaseServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return { success: false, error: 'Only admin can void matches' }
  }

  const { error } = await supabase
    .from('matches')
    .update({ status: 'VOID' })
    .eq('id', matchId)

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/matches')
  revalidatePath('/matches')
  return { success: true }
}