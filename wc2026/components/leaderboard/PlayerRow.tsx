import { cn } from '@/lib/utils/cn'
import type { LeaderboardEntry } from '@/types'

const RANK_STYLES: Record<number, string> = {
  1: 'text-gold font-display text-2xl',
  2: 'text-slate-300 font-display text-xl',
  3: 'text-amber-600 font-display text-xl',
}

export function PlayerRow({ entry, isCurrentUser }: { entry: LeaderboardEntry; isCurrentUser: boolean }) {
  return (
    <div
      className={cn(
        'grid grid-cols-[48px_1fr_80px_80px_80px] items-center gap-2 px-5 py-3.5',
        'border-b border-pitch-700 last:border-0 transition-colors duration-200',
        isCurrentUser && 'bg-pitch-800',
        entry.rank <= 3 && 'animate-rank-change'
      )}
    >
      <span className={cn('text-center', RANK_STYLES[entry.rank] ?? 'text-slate-500 text-sm')}>
        {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : `#${entry.rank}`}
      </span>

      <div className="min-w-0">
        <p className={cn('font-semibold truncate', isCurrentUser ? 'text-neon' : 'text-white')}>
          {entry.display_name} {isCurrentUser && <span className="text-xs text-neon/70">(Bạn)</span>}
        </p>
        {entry.current_streak > 1 && (
          <p className="text-xs text-slate-500">🔥 {entry.current_streak} liên tiếp</p>
        )}
      </div>

      <div className="text-center">
        <p className="font-mono text-sm font-bold text-neon">{entry.correct_count}</p>
        <p className="text-xs text-slate-600">Thắng</p>
      </div>

      <div className="text-center">
        <p className="font-mono text-sm font-bold text-result-lose">{entry.wrong_count}</p>
        <p className="text-xs text-slate-600">Thua</p>
      </div>

      <div className="text-right">
        <p className="font-mono text-sm font-bold text-result-lose">{entry.total_penalty_points}</p>
        <p className="text-xs text-slate-600">Phạt</p>
      </div>
    </div>
  )
}