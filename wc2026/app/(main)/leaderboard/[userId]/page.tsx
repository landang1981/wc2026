import { getSupabaseServerClient } from '@/lib/supabase/server'
import { Card, CardBody } from '@/components/ui/Card'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { BetPrediction, MatchStatus, MatchResult } from '@/types'

type BetWithDetails = {
  id: string
  prediction: BetPrediction
  placed_at: string
  is_correct: boolean | null
  penalty_points: number
  match: {
    match_datetime: string
    status: MatchStatus
    home_score: number | null
    away_score: number | null
    result: MatchResult | null
    home_team: { name: string; flag_emoji: string | null } | null
    away_team: { name: string; flag_emoji: string | null } | null
    round: { name: string } | null
  } | null
}

function extractFirst<T>(value: T | T[] | null): T | null {
  if (Array.isArray(value)) return value.length > 0 ? value[0] ?? null : null
  return (value as T) ?? null
}

function getPredictionLabel(prediction: BetPrediction, homeName?: string, awayName?: string): string {
  if (prediction === 'NOT_BET') return 'Không đặt cược'
  if (prediction === 'HOME_WIN') return homeName ?? 'Chủ nhà'
  if (prediction === 'AWAY_WIN') return awayName ?? 'Khách'
  return 'Hòa'
}

function getResultLabel(result: MatchResult | null, homeName?: string, awayName?: string): string {
  if (!result) return '—'
  if (result === 'HOME_WIN') return homeName ?? 'Chủ nhà'
  if (result === 'AWAY_WIN') return awayName ?? 'Khách'
  return 'Hòa'
}

export async function generateMetadata({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params
  const supabase = await getSupabaseServerClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', userId)
    .single()

  return {
    title: profile ? `Dự đoán của ${profile.display_name}` : 'Người dùng',
  }
}

export default async function UserBetsPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params
  const supabase = await getSupabaseServerClient()

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, display_name, username, role, created_at')
    .eq('id', userId)
    .single()

  if (!profile) notFound()

  // Get all bets for this user
  const { data: bets } = await supabase
    .from('bets')
    .select('id, match_id, prediction, placed_at, is_correct, penalty_points')
    .eq('user_id', userId)
    .order('placed_at', { ascending: false })

  // Get match details
  const matchIds = bets?.map(b => b.match_id) ?? []
  const { data: matches } = matchIds.length > 0 ? await supabase
    .from('matches')
    .select(`
      id,
      match_datetime,
      status,
      home_score,
      away_score,
      result,
      home_team:teams!matches_home_team_id_fkey(name, flag_emoji),
      away_team:teams!matches_away_team_id_fkey(name, flag_emoji),
      round:match_rounds(name)
    `)
    .in('id', matchIds) : { data: [] }

  // Build match map
  const matchMap = new Map<string, BetWithDetails['match']>()
  for (const m of matches || []) {
    matchMap.set(m.id as string, {
      match_datetime: m.match_datetime as string,
      status: m.status as MatchStatus,
      home_score: m.home_score as number | null,
      away_score: m.away_score as number | null,
      result: m.result as MatchResult | null,
      home_team: extractFirst<{ name: string; flag_emoji: string | null }>(m.home_team as never),
      away_team: extractFirst<{ name: string; flag_emoji: string | null }>(m.away_team as never),
      round: extractFirst<{ name: string }>(m.round as never),
    })
  }

  // Combine bets with match data
  const betsWithDetails = (bets ?? []).map(bet => ({
    id: bet.id,
    prediction: bet.prediction as BetPrediction,
    placed_at: bet.placed_at,
    is_correct: bet.is_correct,
    penalty_points: bet.penalty_points,
    match: matchMap.get(bet.match_id) ?? null,
  }))

  // Calculate summary stats
  const totalBets = betsWithDetails.length
  const correctCount = betsWithDetails.filter(b => b.is_correct === true).length
  const wrongCount = betsWithDetails.filter(b => b.is_correct === false).length
  const unsettledCount = betsWithDetails.filter(b => b.is_correct === null).length
  const totalPenalty = betsWithDetails.reduce((sum, b) => sum + b.penalty_points, 0)

  // Check if this is the current user
  const { data: { user } } = await supabase.auth.getUser()
  const isOwn = user?.id === userId

  const createdDate = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'N/A'

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link href="/leaderboard" className="text-sm text-slate-500 hover:text-neon transition-colors">
          ← Bảng Xếp Hạng
        </Link>
      </div>

      {/* User Info Card */}
      <Card className="mb-6">
        <CardBody>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-pitch-700 flex items-center justify-center text-2xl font-display text-white">
              {profile.display_name?.charAt(0).toUpperCase() || '👤'}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-display text-section text-neon truncate">
                {profile.display_name}
                {isOwn && <span className="text-xs text-neon/70 ml-2">(Bạn)</span>}
              </h1>
              <p className="text-sm text-slate-500">{profile.username}</p>
              <p className="text-xs text-slate-600 mt-1">Tham gia: {createdDate}</p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        <Card>
          <CardBody className="text-center py-4">
            <p className="text-3xl font-display text-white">{totalBets}</p>
            <p className="text-xs text-slate-500 mt-1">Tổng trận</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center py-4">
            <p className="text-3xl font-display text-neon">{correctCount}</p>
            <p className="text-xs text-slate-500 mt-1">Đúng</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center py-4">
            <p className="text-3xl font-display text-result-lose">{wrongCount}</p>
            <p className="text-xs text-slate-500 mt-1">Sai</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center py-4">
            <p className="text-3xl font-display text-slate-400">{unsettledCount}</p>
            <p className="text-xs text-slate-500 mt-1">Chưa có KQ</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center py-4">
            <p className="text-3xl font-display text-result-lose">{totalPenalty}</p>
            <p className="text-xs text-slate-500 mt-1">Điểm phạt</p>
          </CardBody>
        </Card>
      </div>

      {/* Bets Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px]">
            <thead>
              <tr className="border-b border-pitch-700 text-left text-sm text-slate-500">
                <th className="p-4 font-medium">Trận đấu</th>
                <th className="p-4 font-medium text-center">Lựa chọn</th>
                <th className="p-4 font-medium text-center">Kết quả</th>
                <th className="p-4 font-medium text-center">Tỉ số</th>
                <th className="p-4 font-medium text-right">Điểm phạt</th>
              </tr>
            </thead>
            <tbody>
              {betsWithDetails.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    Người dùng này chưa có dự đoán nào
                  </td>
                </tr>
              ) : (
                betsWithDetails.map(bet => {
                  const m = bet.match
                  const homeName = m?.home_team?.name
                  const awayName = m?.away_team?.name
                  const matchLabel = homeName && awayName ? `${homeName} vs ${awayName}` : 'Trận đấu không tồn tại'
                  const isNotBet = bet.prediction === 'NOT_BET'
                  const isCorrect = bet.is_correct

                  return (
                    <tr key={bet.id} className={`border-b border-pitch-700 last:border-0 hover:bg-pitch-800/50 ${isNotBet ? 'opacity-70' : ''}`}>
                      <td className="p-4">
                        <p className={`text-sm font-medium ${isNotBet ? 'text-slate-400' : 'text-white'}`}>
                          {m?.home_team?.flag_emoji ?? ''} {matchLabel}
                        </p>
                        <p className="text-xs text-slate-600 mt-0.5">
                          {m?.round?.name ?? ''}
                          {m?.match_datetime
                            ? ` · ${new Date(m.match_datetime).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`
                            : ''}
                        </p>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`text-sm font-semibold ${
                          isNotBet
                            ? 'text-slate-500 italic'
                            : isCorrect === true
                              ? 'text-neon'
                              : isCorrect === false
                                ? 'text-result-lose'
                                : 'text-slate-300'
                        }`}>
                          {getPredictionLabel(bet.prediction, homeName, awayName)}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        {m && (m.status === 'SETTLED' || m.status === 'VOID') ? (
                          <span className="text-sm text-slate-400">
                            {getResultLabel(m.result, homeName, awayName)}
                          </span>
                        ) : m && (m.status === 'PENDING_SETTLEMENT' || m.status === 'CONFIRMED') ? (
                          <span className="text-xs text-yellow-500">Chờ duyệt</span>
                        ) : m && m.status === 'LIVE' ? (
                          <span className="text-xs text-status-live">Đang đá</span>
                        ) : (
                          <span className="text-xs text-slate-500">—</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {m && m.home_score !== null && m.away_score !== null ? (
                          <span className="font-mono text-sm text-slate-400">
                            {m.home_score} - {m.away_score}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-600">—</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        {isCorrect !== null ? (
                          <span className={`text-sm font-mono font-bold ${isCorrect ? 'text-neon' : 'text-result-lose'}`}>
                            {isCorrect ? '0' : `-${bet.penalty_points}`}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
