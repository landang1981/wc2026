'use client'
import { cn } from '@/lib/utils/cn'
import type { BetPrediction } from '@/types'

const OPTIONS: { value: BetPrediction; label: string; shortLabel: string }[] = [
  { value: 'HOME_WIN', label: 'Chủ Nhà Thắng', shortLabel: '1' },
  { value: 'DRAW', label: 'Hòa', shortLabel: 'X' },
  { value: 'AWAY_WIN', label: 'Đội Khách Thắng', shortLabel: '2' },
]

type BetSelectorProps = {
  value: BetPrediction | null
  onChange: (v: BetPrediction) => void
  disabled?: boolean
  homeTeam: string
  awayTeam: string
}

export function BetSelector({ value, onChange, disabled, homeTeam, awayTeam }: BetSelectorProps) {
  const labels = [homeTeam, 'Hòa', awayTeam]
  return (
    <div className="grid grid-cols-3 gap-2">
      {OPTIONS.map((opt, i) => {
        const isSelected = value === opt.value
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            disabled={disabled}
            className={cn(
              'flex flex-col items-center gap-1 py-3 px-2 rounded-chip border text-center transition-all duration-150',
              'disabled:opacity-40 disabled:cursor-not-allowed',
              isSelected
                ? 'bg-neon-glow border-neon text-neon shadow-neon-sm scale-[1.02]'
                : 'bg-pitch-800 border-pitch-600 text-slate-400 hover:border-pitch-500 hover:text-white'
            )}
          >
            <span className="font-display text-2xl leading-none">{opt.shortLabel}</span>
            <span className="text-[10px] leading-tight font-medium">{labels[i]}</span>
          </button>
        )
      })}
    </div>
  )
}