import { getSupabaseServerClient } from '@/lib/supabase/server'
import { Card, CardBody } from '@/components/ui/Card'
import type { BetPrediction, MatchStatus, MatchResult } from '@/types'

type BetWithDetails = {
  id: string
  prediction: BetPrediction
  placed_at: string
  is_correct: boolean | null
  penalty_points: number
  match: {
    id: string
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

async function getMyBetsWithDetails(): Promise<BetWithDetails[]> {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // Step 1: Get all bets for this user
  const { data: bets } = await supabase
    .from('bets')
    .select('id, match_id, prediction, placed_at, is_correct, penalty_points')
    .eq('user_id', user.id)
    .order('placed_at', { ascending: false })

  if (!bets || bets.length === 0) return []

  // Step 2: Get all matching matches with team details (same query as matches page)
  const matchIds = bets.map(b => b.match_id)
  const { data: matches } = await supabase
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
    .in('id', matchIds)

  // Step 3: Build match map
  const matchMap = new Map<string, BetWithDetails['match']>()
  for (const m of matches || []) {
    matchMap.set(m.id as string, {
      id: m.id as string,
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

  // Step 4: Combine bets with match data
  return bets.map(bet => ({
    id: bet.id,
    prediction: bet.prediction as BetPrediction,
    placed_at: bet.placed_at,
    is_correct: bet.is_correct,
    penalty_points: bet.penalty_points,
    match: matchMap.get(bet.match_id) ?? null,
  }))
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

export default async function MyBetsPage() {
  const bets = await getMyBetsWithDetails()

  // NOT_BET được tính vào "Sai" (không cược = thua cuộc)
  const totalBets = bets.length
  const correctCount = bets.filter(b => b.is_correct === true).length
  const wrongCount = bets.filter(b => b.is_correct === false).length
  const unsettledCount = bets.filter(b => b.is_correct === null).length
  const totalPenalty = bets.reduce((sum, b) => sum + b.penalty_points, 0)

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="font-display text-hero text-neon mb-2">MY BETS</h1>
        <p className="text-slate-500 text-sm">Tổng quan dự đoán của bạn</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
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
            <p className="text-xs text-slate-500 mt-1">Sai (gồm không cược)</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center py-4">
            <p className="text-3xl font-display text-result-lose">{totalPenalty}</p>
            <p className="text-xs text-slate-500 mt-1">Điểm phạt</p>
          </CardBody>
        </Card>
      </div>

      {/* Bets Table - show ALL bets including NOT_BET */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-pitch-700 text-left text-sm text-slate-500">
                <th className="p-4 font-medium">Trận đấu</th>
                <th className="p-4 font-medium">Lựa chọn của bạn</th>
                <th className="p-4 font-medium">Kết quả</th>
                <th className="p-4 font-medium">Điểm phạt</th>
              </tr>
            </thead>
            <tbody>
              {bets.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">
                    Bạn chưa có dự đoán nào
                  </td>
                </tr>
              ) : (
                bets.map(bet => {
                  const match = bet.match
                  const homeName = match?.home_team?.name
                  const awayName = match?.away_team?.name
                  const matchLabel = homeName && awayName ? `${homeName} vs ${awayName}` : 'Trận đấu không tồn tại'
                  const isNotBet = bet.prediction === 'NOT_BET'

                  return (
                    <tr key={bet.id} className={`border-b border-pitch-700 last:border-0 hover:bg-pitch-800/50 ${isNotBet ? 'opacity-70' : ''}`}>
                      <td className="p-4">
                        <p className={`text-sm font-medium ${isNotBet ? 'text-slate-400' : 'text-white'}`}>{matchLabel}</p>
                        <p className="text-xs text-slate-600 mt-0.5">
                          {match?.round?.name ?? ''}
                          {match?.match_datetime
                            ? ` · ${new Date(match.match_datetime).toLocaleDateString('vi-VN')}`
                            : ''}
                        </p>
                      </td>
                      <td className="p-4">
                        <span className={`text-sm ${isNotBet ? 'text-slate-500 italic' : 'text-slate-300'}`}>
                          {getPredictionLabel(bet.prediction, homeName, awayName)}
                        </span>
                      </td>
                      <td className="p-4">
                        {bet.is_correct !== null ? (
                          <span className="text-sm text-slate-400">
                            {match?.home_score !== null && match?.away_score !== null
                              ? `${match?.home_score} - ${match?.away_score}`
                              : getResultLabel(match?.result ?? null, homeName, awayName)}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500">Chưa có kết quả</span>
                        )}
                      </td>
                      <td className="p-4">
                        {bet.is_correct !== null ? (
                          <span className={`text-sm font-mono font-bold ${bet.is_correct ? 'text-neon' : 'text-result-lose'}`}>
                            {bet.is_correct ? '0' : `-${bet.penalty_points}`}
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
