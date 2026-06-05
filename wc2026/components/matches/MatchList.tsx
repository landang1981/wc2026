import { MatchCard } from './MatchCard'
import type { MatchCardProps } from './MatchCard'
import type { BetPrediction, MatchStatus } from '@/types'
import { MATCH_ROUNDS } from '@/types'

type MatchWithRelations = {
  id: string
  match_datetime: string
  status: MatchStatus
  home_score: number | null
  away_score: number | null
  result: string | null
  round_id: string
  home_team: { name: string; flag_emoji: string | null } | null
  away_team: { name: string; flag_emoji: string | null } | null
  round: { name: string } | null
  my_bet: { prediction: BetPrediction } | null
}

type MatchListProps = {
  matches: MatchWithRelations[]
  onBetSelect?: (matchId: string, prediction: BetPrediction) => void
  isLocked?: boolean
}

export function MatchList({ matches, onBetSelect, isLocked }: MatchListProps) {
  const matchesByRound = MATCH_ROUNDS.reduce((acc, round) => {
    const roundMatches = matches.filter(m => m.round_id === round.id)
    if (roundMatches.length > 0) {
      acc.push({ round, matches: roundMatches })
    }
    return acc
  }, [] as { round: typeof MATCH_ROUNDS[number]; matches: MatchWithRelations[] }[])

  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <span className="text-6xl mb-4">⚽</span>
        <h3 className="font-display text-section text-white mb-2">Chưa có trận đấu</h3>
        <p className="text-slate-500 text-sm">Các trận đấu sẽ được cập nhật sớm nhất</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {matchesByRound.map(({ round, matches: roundMatches }) => (
        <section key={round.id}>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="font-display text-section text-neon">{round.name}</h2>
            <div className="flex-1 h-px bg-pitch-700" />
            <span className="text-xs text-slate-500">{roundMatches.length} trận</span>
          </div>
          <div className="grid gap-4 grid-cols-2">
            {roundMatches.map(match => {
              const cardProps: MatchCardProps = {
                match,
                myBet: match.my_bet,
              }
              if (onBetSelect) {
                cardProps.onBetSelect = (p: BetPrediction) => onBetSelect(match.id, p)
              }
              if (isLocked !== undefined) {
                cardProps.isLocked = isLocked
              }
              return <MatchCard key={match.id} {...cardProps} />
            })}
          </div>
        </section>
      ))}
    </div>
  )
}