'use client'

import { useState } from 'react'
import { MatchList } from '@/components/matches/MatchList'
import { placeBet, updateBet } from '@/lib/actions/bet.actions'
import type { BetPrediction } from '@/types'

type MatchWithBet = {
  id: string
  match_datetime: string
  status: 'SCHEDULED' | 'LIVE' | 'PENDING_SETTLEMENT' | 'CONFIRMED' | 'SETTLED' | 'POSTPONED' | 'ABANDONED' | 'VOID'
  home_score: number | null
  away_score: number | null
  result: string | null
  round_id: string
  home_team: { name: string; flag_emoji: string | null } | null
  away_team: { name: string; flag_emoji: string | null } | null
  round: { name: string } | null
  my_bet: { prediction: BetPrediction } | null
}

type Props = {
  initialMatches: MatchWithBet[]
}

export function MatchesClient({ initialMatches }: Props) {
  const [matches, setMatches] = useState<MatchWithBet[]>(initialMatches)
  const [error, setError] = useState<string | null>(null)

  async function handleBetSelect(matchId: string, prediction: BetPrediction) {
    const match = matches.find(m => m.id === matchId)
    if (!match) return

    if (match.status !== 'SCHEDULED') {
      setError(`Trận đấu đã ${match.status === 'LIVE' ? 'bắt đầu' : 'kết thúc'}, không thể đặt cược`)
      setTimeout(() => setError(null), 3000)
      return
    }
    if (new Date(match.match_datetime) <= new Date()) {
      setError('Trận đấu đã bắt đầu, không thể đặt cược')
      setTimeout(() => setError(null), 3000)
      return
    }

    const result = match.my_bet
      ? await updateBet(matchId, prediction)
      : await placeBet(matchId, prediction)

    if (!result.error) {
      setMatches(prev => prev.map(m => {
        if (m.id === matchId) {
          return { ...m, my_bet: { prediction } }
        }
        return m
      }))
      setError(null)
    } else {
      setError(result.error ?? 'Failed to place bet')
      setTimeout(() => setError(null), 3000)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-chip text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="mb-6">
        <h1 className="font-display text-hero text-neon mb-2">TRẬN ĐẤU</h1>
        <p className="text-slate-500 text-sm">Đặt cược và theo dõi kết quả</p>
      </div>

      <MatchList matches={matches} onBetSelect={handleBetSelect} />
    </div>
  )
}