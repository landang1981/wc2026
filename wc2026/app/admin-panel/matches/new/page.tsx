'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createMatch } from '@/lib/actions/match.actions'

type TeamOption = { id: string; name: string; flag_emoji: string | null }
type RoundOption = { id: string; name: string }
type MatchesApiResponse = { teams?: TeamOption[]; rounds?: RoundOption[] }

export default function NewMatchPage() {
  const [teams, setTeams] = useState<TeamOption[]>([])
  const [rounds, setRounds] = useState<RoundOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/matches?view=options')
      .then(r => r.json())
      .then((data: MatchesApiResponse) => {
        if (data.teams) setTeams(data.teams)
        if (data.rounds) setRounds(data.rounds)
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to load data')
        setLoading(false)
      })
  }, [])

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)

    const input = {
      homeTeamId: formData.get('home_team_id') as string,
      awayTeamId: formData.get('away_team_id') as string,
      matchDatetime: formData.get('match_datetime') as string,
      roundId: formData.get('round_id') as string,
      venue: formData.get('venue') as string,
    }

    const result = await createMatch(input)

    if (!result.success) {
      setError(result.error ?? 'Failed to create match')
      setLoading(false)
      return
    }

    router.push('/admin-panel/matches')
  }

  if (loading && teams.length === 0) {
    return <div className="text-slate-400 p-8 text-center">Đang tải...</div>
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-6">
        <a href="/admin-panel/matches" className="text-neon text-sm hover:underline">← Quay lại</a>
      </div>
      <h1 className="font-display text-2xl text-gold mb-6">TẠO TRẬN ĐẤU MỚI</h1>

      <form action={handleSubmit} className="bg-pitch-800 rounded-card p-6 border border-pitch-600 space-y-4">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-chip text-red-400 text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="home_team_id" className="block text-sm text-slate-400 mb-1">Đội nhà</label>
          <select
            id="home_team_id"
            name="home_team_id"
            required
            className="w-full px-4 py-2 bg-pitch-700 border border-pitch-600 rounded-chip text-white focus:border-neon focus:outline-none"
          >
            <option value="">Chọn đội nhà</option>
            {teams.map(t => (
              <option key={t.id} value={t.id}>{t.flag_emoji} {t.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="away_team_id" className="block text-sm text-slate-400 mb-1">Đội khách</label>
          <select
            id="away_team_id"
            name="away_team_id"
            required
            className="w-full px-4 py-2 bg-pitch-700 border border-pitch-600 rounded-chip text-white focus:border-neon focus:outline-none"
          >
            <option value="">Chọn đội khách</option>
            {teams.map(t => (
              <option key={t.id} value={t.id}>{t.flag_emoji} {t.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="match_datetime" className="block text-sm text-slate-400 mb-1">Thời gian</label>
          <input
            type="datetime-local"
            id="match_datetime"
            name="match_datetime"
            required
            className="w-full px-4 py-2 bg-pitch-700 border border-pitch-600 rounded-chip text-white focus:border-neon focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="round_id" className="block text-sm text-slate-400 mb-1">Vòng đấu</label>
          <select
            id="round_id"
            name="round_id"
            required
            className="w-full px-4 py-2 bg-pitch-700 border border-pitch-600 rounded-chip text-white focus:border-neon focus:outline-none"
          >
            <option value="">Chọn vòng đấu</option>
            {rounds.map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="venue" className="block text-sm text-slate-400 mb-1">Địa điểm (tùy chọn)</label>
          <input
            type="text"
            id="venue"
            name="venue"
            placeholder="Ví dụ: Lusail Stadium"
            className="w-full px-4 py-2 bg-pitch-700 border border-pitch-600 rounded-chip text-white focus:border-neon focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 bg-neon text-pitch-950 font-bold rounded-pill hover:bg-neon-dim transition-colors disabled:opacity-50"
        >
          {loading ? 'Đang tạo...' : 'TẠO TRẬN ĐẤU'}
        </button>
      </form>
    </div>
  )
}