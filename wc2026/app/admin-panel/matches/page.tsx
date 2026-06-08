import Link from 'next/link'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { StatusBadge } from '@/components/ui/Badge'
import { redirect } from 'next/navigation'
import type { MatchStatus } from '@/types'

const SETTLED_STATUSES: MatchStatus[] = ['SETTLED', 'VOID', 'POSTPONED', 'ABANDONED']

type HomeTeam = { name: string; flag_emoji: string | null } | null
type AwayTeam = { name: string; flag_emoji: string | null } | null
type Round = { name: string } | null

type MatchRow = {
  id: string
  match_datetime: string
  venue: string | null
  status: MatchStatus
  home_score: number | null
  away_score: number | null
  result: string | null
  home_team: HomeTeam[] | HomeTeam
  away_team: AwayTeam[] | AwayTeam
  round: Round[] | Round
}

function getHomeTeam(match: MatchRow): HomeTeam {
  return Array.isArray(match.home_team) ? match.home_team[0] ?? null : match.home_team
}

function getAwayTeam(match: MatchRow): AwayTeam {
  return Array.isArray(match.away_team) ? match.away_team[0] ?? null : match.away_team
}

function getRound(match: MatchRow): Round {
  return Array.isArray(match.round) ? match.round[0] ?? null : match.round
}

export default async function AdminMatchesPage() {
  const supabase = await getSupabaseServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin'

  const { data: matches } = await supabase
    .from('matches')
    .select(`
      id,
      match_datetime,
      venue,
      status,
      home_score,
      away_score,
      result,
      created_at,
      home_team:teams!matches_home_team_id_fkey(name, flag_emoji),
      away_team:teams!matches_away_team_id_fkey(name, flag_emoji),
      round:match_rounds(name)
    `)
    .order('match_datetime', { ascending: true })

  const typedMatches = ((matches ?? []) as MatchRow[]).sort((a, b) => {
    const aSettled = SETTLED_STATUSES.includes(a.status)
    const bSettled = SETTLED_STATUSES.includes(b.status)
    if (aSettled !== bSettled) return aSettled ? 1 : -1
    return new Date(a.match_datetime).getTime() - new Date(b.match_datetime).getTime()
  })

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-display text-2xl text-gold">QUẢN LÝ TRẬN ĐẤU</h1>
        <div className="flex gap-3">
          {isAdmin && (
            <Link href="/admin-panel/matches/new" className="px-4 py-2 bg-neon text-pitch-950 rounded-chip font-bold hover:bg-neon-dim transition-colors">
              + Tạo Trận mới
            </Link>
          )}
        </div>
      </div>

      <div className="bg-pitch-800 rounded-card border border-pitch-600 overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-pitch-600 text-left text-sm text-slate-500">
              <th className="p-4 font-medium">Trận đấu</th>
              <th className="p-4 font-medium">Ngày</th>
              <th className="p-4 font-medium">Vòng</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Kết quả</th>
              <th className="p-4 font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {typedMatches.length > 0 ? (
              typedMatches.map(m => {
                const home = getHomeTeam(m)
                const away = getAwayTeam(m)
                const round = getRound(m)
                return (
                <tr key={m.id} className="border-b border-pitch-700 last:border-0 hover:bg-pitch-750">
                  <td className="p-4">
                    <p className="text-white">
                      {home?.flag_emoji} {home?.name} vs {away?.flag_emoji} {away?.name}
                    </p>
                    {m.venue && <p className="text-xs text-slate-500 mt-1">📍 {m.venue}</p>}
                  </td>
                  <td className="p-4 text-slate-400 text-sm whitespace-nowrap font-mono">
                    {new Date(m.match_datetime).toLocaleString('vi-VN', {
                      timeZone: 'Asia/Ho_Chi_Minh',
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="p-4 text-slate-400 text-sm">{round?.name ?? 'N/A'}</td>
                  <td className="p-4"><StatusBadge status={m.status} /></td>
                  <td className="p-4 font-mono text-sm">
                    {m.home_score !== null && m.away_score !== null
                      ? `${m.home_score} - ${m.away_score}`
                      : '—'}
                    {m.result && <span className="text-neon ml-2">{m.result}</span>}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <a
                        href={`/admin-panel/matches/${m.id}/settle`}
                        className="text-xs px-2 py-1 bg-neon/20 text-neon rounded hover:bg-neon/30 transition-colors"
                      >
                        {m.status === 'SETTLED' ? 'Chỉnh sửa' : 'Settle'}
                      </a>
                    </div>
                  </td>
                </tr>
              )})
            ) : (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500">Chưa có trận đấu nào</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}