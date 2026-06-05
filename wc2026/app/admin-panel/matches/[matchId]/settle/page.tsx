'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { settleMatch } from '@/lib/actions/match.actions'

type MatchDetail = {
  id: string
  match_datetime: string
  home_team: { name: string; flag_emoji: string | null } | null
  away_team: { name: string; flag_emoji: string | null } | null
  home_score: number | null
  away_score: number | null
}

export default function SettleMatchPage({ params }: { params: Promise<{ matchId: string }> }) {
  const [matchId, setMatchId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [match, setMatch] = useState<MatchDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    params.then(p => setMatchId(p.matchId))
  }, [params])

  useEffect(() => {
    if (!matchId) return
    fetch(`/api/matches/${matchId}`)
      .then(r => r.json())
      .then(d => {
        setMatch(d.data)
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to load match')
        setLoading(false)
      })
  }, [matchId])

  async function handleSubmit(formData: FormData) {
    if (!matchId) return
    setLoading(true)
    setError(null)

    const homeScore = parseInt(formData.get('home_score') as string)
    const awayScore = parseInt(formData.get('away_score') as string)
    let result: 'HOME_WIN' | 'AWAY_WIN' | 'DRAW' = 'DRAW'
    if (homeScore > awayScore) result = 'HOME_WIN'
    else if (homeScore < awayScore) result = 'AWAY_WIN'

    const result2 = await settleMatch(matchId, homeScore, awayScore, result)
    if (!result2.success) {
      setError(result2.error ?? 'Failed to settle match')
      setLoading(false)
      return
    }

    router.push('/admin-panel/matches')
  }

  if (loading && !match) {
    return <div className="text-slate-400 p-8 text-center">Đang tải...</div>
  }

  if (!match) {
    return <div className="text-red-400 p-8 text-center">Không tìm thấy trận đấu</div>
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-6">
        <a href="/admin-panel/matches" className="text-neon text-sm hover:underline">← Quay lại</a>
      </div>
      <h1 className="font-display text-2xl text-gold mb-2">KẾT QUẢ TRẬN ĐẤU</h1>
      <p className="text-slate-400 mb-6">
        {match.home_team?.name} vs {match.away_team?.name}
      </p>

      <form action={handleSubmit} className="bg-pitch-800 rounded-card p-6 border border-pitch-600 space-y-4">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-chip text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="home_score" className="block text-sm text-slate-400 mb-1">
              {match.home_team?.name} (home)
            </label>
            <input
              type="number"
              id="home_score"
              name="home_score"
              min="0"
              required
              defaultValue={match.home_score ?? ''}
              className="w-full px-4 py-2 bg-pitch-700 border border-pitch-600 rounded-chip text-white text-center text-xl focus:border-neon focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="away_score" className="block text-sm text-slate-400 mb-1">
              {match.away_team?.name} (away)
            </label>
            <input
              type="number"
              id="away_score"
              name="away_score"
              min="0"
              required
              defaultValue={match.away_score ?? ''}
              className="w-full px-4 py-2 bg-pitch-700 border border-pitch-600 rounded-chip text-white text-center text-xl focus:border-neon focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 bg-neon text-pitch-950 font-bold rounded-pill hover:bg-neon-dim transition-colors disabled:opacity-50"
        >
          {loading ? 'Đang xử lý...' : 'XÁC NHẬN KẾT QUẢ'}
        </button>
      </form>
    </div>
  )
}