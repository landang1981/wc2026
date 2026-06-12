import { Card, CardBody } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/Badge'
import { BetSelector } from './BetSelector'
import { MatchTime } from './CountdownTimer'
import type { BetPrediction, MatchStatus } from '@/types'

export type MatchCardProps = {
  match: {
    id: string
    match_datetime: string
    status: MatchStatus
    home_score: number | null
    away_score: number | null
    result: string | null
    round?: { name: string } | null
    home_team?: { name: string; flag_emoji: string | null } | null
    away_team?: { name: string; flag_emoji: string | null } | null
  }
  myBet?: { prediction: BetPrediction } | null
  onBetSelect?: (prediction: BetPrediction) => void
  isLocked?: boolean
}

export function MatchCard({ match, myBet, onBetSelect, isLocked }: MatchCardProps) {
  const isSettled = match.status === 'SETTLED'
  const canBet = !isSettled && !isLocked && match.status === 'SCHEDULED'
  const hasStarted = new Date(match.match_datetime) <= new Date()

  return (
    <Card className="hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200">
      <CardBody>
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-slate-500 font-medium">{match.round?.name ?? 'Trận đấu'}</span>
          <StatusBadge status={match.status} hasStarted={hasStarted} />
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 my-4">
          <div className="text-right min-w-0">
            <div className="text-2xl">{match.home_team?.flag_emoji ?? '🏳️'}</div>
            <div className="font-display text-section text-white leading-tight truncate">{match.home_team?.name ?? 'TBD'}</div>
          </div>

          <div className="text-center flex flex-col items-center gap-1">
            {isSettled ? (
              <span className="font-display text-score text-neon">
                {match.home_score} – {match.away_score}
              </span>
            ) : (
              <MatchTime datetime={match.match_datetime} />
            )}
          </div>

          <div className="text-left min-w-0">
            <div className="text-2xl">{match.away_team?.flag_emoji ?? '🏳️'}</div>
            <div className="font-display text-section text-white leading-tight truncate">{match.away_team?.name ?? 'TBD'}</div>
          </div>
        </div>

        {myBet && myBet.prediction !== 'NOT_BET' ? (
          <div className="mt-4 pt-4 border-t border-pitch-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500">Dự đoán của bạn</span>
              <span className={isSettled ? (myBet.prediction === match.result ? 'text-neon' : 'text-result-lose') : 'text-slate-400'}>
                {myBet.prediction === 'HOME_WIN' ? (match.home_team?.name ?? 'Chủ nhà') : myBet.prediction === 'AWAY_WIN' ? (match.away_team?.name ?? 'Khách') : 'Hòa'}
              </span>
            </div>
            {/* Cho phép đổi dự đoán nếu trận chưa bắt đầu */}
            {canBet && !hasStarted && onBetSelect && (
              <>
                <p className="text-xs text-slate-500 mb-2 text-center">Thay đổi dự đoán</p>
                <BetSelector
                  value={myBet.prediction}
                  onChange={onBetSelect}
                  homeTeam={match.home_team?.name ?? 'Chủ nhà'}
                  awayTeam={match.away_team?.name ?? 'Khách'}
                />
              </>
            )}
          </div>
        ) : myBet?.prediction === 'NOT_BET' ? (
          <div className="mt-4 pt-4 border-t border-pitch-700">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Dự đoán của bạn</span>
              <div className="text-right">
                <span className="text-xs text-slate-500 italic">Không đặt cược</span>
                {isSettled && (
                  <p className="text-xs font-bold text-result-lose">✗ Sai (+50)</p>
                )}
              </div>
            </div>
          </div>
        ) : canBet && onBetSelect ? (
          <div className="mt-4 pt-4 border-t border-pitch-700">
            <p className="text-xs text-slate-500 mb-2 text-center">Chọn dự đoán của bạn</p>
            <BetSelector
              value={null}
              onChange={onBetSelect}
              homeTeam={match.home_team?.name ?? 'Chủ nhà'}
              awayTeam={match.away_team?.name ?? 'Khách'}
            />
          </div>
        ) : null}
      </CardBody>
    </Card>
  )
}