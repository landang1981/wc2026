# 04 — Design System: Premium Dark Sportsbook

**Theme:** Dark Football Stadium Night · Neon Green `#00FF87` accents · Gold leaderboard
**Stack:** Tailwind CSS v3 · Next.js 14 · `next/font` · shadcn/ui primitives

---

## Part 1 — Tailwind Configuration

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      // ─── Color Palette ───────────────────────────────────────────
      colors: {
        neon: {
          DEFAULT: '#00FF87',
          dim:     '#00CC6A',
          glow:    '#00FF8733',   // 20% opacity for glow effects
        },
        gold: {
          DEFAULT: '#FFD700',
          light:   '#FFE566',
          dim:     '#B8960C',
          glow:    '#FFD70033',
        },
        pitch: {
          950: '#030712',   // deepest background
          900: '#0A0F1E',   // main page bg
          800: '#0F172A',   // card bg
          700: '#1E293B',   // elevated card / panel
          600: '#334155',   // border / divider
          500: '#475569',   // muted text bg
        },
        result: {
          win:  '#00FF87',   // neon green — correct prediction
          lose: '#FF4444',   // red — wrong prediction
          draw: '#94A3B8',   // slate — draw / neutral
        },
        status: {
          scheduled:  '#3B82F6',   // blue
          live:       '#EF4444',   // red (pulsing)
          pending:    '#F59E0B',   // amber
          settled:    '#6B7280',   // gray
          postponed:  '#8B5CF6',   // purple
          void:       '#374151',   // dark gray
        },
      },

      // ─── Typography ──────────────────────────────────────────────
      fontFamily: {
        display: ['var(--font-bebas)', 'Impact', 'sans-serif'],
        body:    ['var(--font-inter)',  'system-ui', 'sans-serif'],
        mono:    ['var(--font-jetbrains)', 'monospace'],
      },
      fontSize: {
        'score':   ['4.5rem',  { lineHeight: '1',    letterSpacing: '0.05em',  fontWeight: '400' }],
        'hero':    ['3rem',    { lineHeight: '1',    letterSpacing: '0.08em' }],
        'section': ['1.75rem', { lineHeight: '1.1',  letterSpacing: '0.06em' }],
      },

      // ─── Spacing / Layout ─────────────────────────────────────────
      borderRadius: {
        card:  '12px',
        pill:  '999px',
        chip:  '6px',
      },

      // ─── Shadows / Glow ──────────────────────────────────────────
      boxShadow: {
        neon:       '0 0 20px #00FF8766, 0 0 40px #00FF8733',
        'neon-sm':  '0 0 8px  #00FF8799',
        gold:       '0 0 20px #FFD70066, 0 0 40px #FFD70033',
        'card':     '0 4px 24px rgba(0,0,0,0.6)',
        'card-hover':'0 8px 32px rgba(0,0,0,0.8), 0 0 0 1px #00FF8733',
      },

      // ─── Animations ───────────────────────────────────────────────
      keyframes: {
        'pulse-live': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 0 0 #EF444466' },
          '50%':      { opacity: '0.8', boxShadow: '0 0 0 8px #EF444400' },
        },
        'neon-flicker': {
          '0%, 19%, 21%, 23%, 25%, 54%, 56%, 100%': { opacity: '1' },
          '20%, 24%, 55%':                          { opacity: '0.6' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'rank-change': {
          '0%':   { backgroundColor: '#00FF8722' },
          '100%': { backgroundColor: 'transparent' },
        },
      },
      animation: {
        'pulse-live':    'pulse-live 1.5s ease-in-out infinite',
        'neon-flicker':  'neon-flicker 3s linear infinite',
        'slide-up':      'slide-up 0.2s ease-out',
        'rank-change':   'rank-change 1.5s ease-out',
      },

      // ─── Background Patterns ──────────────────────────────────────
      backgroundImage: {
        'stadium-gradient': 'radial-gradient(ellipse at 50% 0%, #0F2027 0%, #0A0F1E 60%, #030712 100%)',
        'card-gradient':    'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
        'neon-gradient':    'linear-gradient(90deg, #00FF87, #00CC6A)',
        'gold-gradient':    'linear-gradient(135deg, #FFD700, #B8960C)',
      },
    },
  },
  plugins: [],
}

export default config
```

---

## Part 2 — Global Font Setup

```typescript
// app/layout.tsx
import { Bebas_Neue, Inter, JetBrains_Mono } from 'next/font/google'

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${bebasNeue.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-pitch-900 font-body text-white antialiased min-h-screen bg-stadium-gradient">
        {children}
      </body>
    </html>
  )
}
```

---

## Part 3 — Global CSS Base

```css
/* app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * { @apply border-pitch-600; }

  ::-webkit-scrollbar       { @apply w-1.5; }
  ::-webkit-scrollbar-track { @apply bg-pitch-900; }
  ::-webkit-scrollbar-thumb { @apply bg-pitch-600 rounded-full hover:bg-pitch-500; }

  ::selection { @apply bg-neon-glow text-neon; }
}

@layer components {
  /* Neon text glow utility */
  .text-neon-glow {
    text-shadow: 0 0 10px #00FF87, 0 0 20px #00FF8780;
  }
  .text-gold-glow {
    text-shadow: 0 0 10px #FFD700, 0 0 20px #FFD70080;
  }
}
```

---

## Part 4 — Atomic UI Components

### 4.1 Button

```tsx
// components/ui/Button.tsx
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils/cn'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-pill font-body font-semibold text-sm transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon disabled:pointer-events-none disabled:opacity-40 select-none',
  {
    variants: {
      variant: {
        primary:   'bg-neon text-pitch-950 hover:bg-neon-dim shadow-neon-sm hover:shadow-neon active:scale-95',
        secondary: 'bg-pitch-700 text-white border border-pitch-600 hover:border-neon hover:text-neon active:scale-95',
        ghost:     'text-slate-400 hover:text-white hover:bg-pitch-700 active:scale-95',
        danger:    'bg-result-lose/10 text-result-lose border border-result-lose/30 hover:bg-result-lose hover:text-white active:scale-95',
        gold:      'bg-gold-gradient text-pitch-950 font-bold hover:shadow-gold active:scale-95',
      },
      size: {
        sm:  'h-8  px-3 text-xs',
        md:  'h-10 px-5 text-sm',
        lg:  'h-12 px-8 text-base',
        icon:'h-10 w-10 p-0',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
)

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { isLoading?: boolean }

export function Button({ className, variant, size, isLoading, children, ...props }: ButtonProps) {
  return (
    <button className={cn(buttonVariants({ variant, size }), className)} disabled={isLoading || props.disabled} {...props}>
      {isLoading && <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />}
      {children}
    </button>
  )
}
```

---

### 4.2 Card

```tsx
// components/ui/Card.tsx
import { cn } from '@/lib/utils/cn'

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  glow?: 'neon' | 'gold' | 'none'
}

export function Card({ className, glow = 'none', children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'relative rounded-card bg-card-gradient border border-pitch-600 shadow-card',
        'transition-all duration-200',
        glow === 'neon' && 'border-neon/30 shadow-neon-sm',
        glow === 'gold' && 'border-gold/30 shadow-gold',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-5 pt-5 pb-3 border-b border-pitch-600', className)} {...props} />
}

export function CardBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-5 py-4', className)} {...props} />
}
```

---

### 4.3 Input & Select

```tsx
// components/ui/Input.tsx
import { cn } from '@/lib/utils/cn'

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }

export function Input({ label, error, className, id, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label htmlFor={id} className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</label>}
      <input
        id={id}
        className={cn(
          'h-11 w-full rounded-chip bg-pitch-800 border border-pitch-600 px-4 text-white text-sm',
          'placeholder:text-slate-600 transition-colors duration-150',
          'focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon',
          error && 'border-result-lose focus:border-result-lose focus:ring-result-lose',
          className
        )}
        {...props}
      />
      {error && <span className="text-xs text-result-lose">{error}</span>}
    </div>
  )
}
```

---

### 4.4 Badge (Match Status)

```tsx
// components/ui/Badge.tsx
import { cn } from '@/lib/utils/cn'
import type { MatchStatus } from '@/types'

const STATUS_CONFIG: Record<MatchStatus, { label: string; className: string }> = {
  SCHEDULED:          { label: 'Sắp Diễn Ra',  className: 'bg-status-scheduled/15 text-status-scheduled border-status-scheduled/30' },
  LIVE:               { label: '● LIVE',        className: 'bg-status-live/15 text-status-live border-status-live/30 animate-pulse-live' },
  PENDING_SETTLEMENT: { label: 'Chờ Duyệt',    className: 'bg-status-pending/15 text-status-pending border-status-pending/30' },
  SETTLED:            { label: 'Đã Kết Thúc',  className: 'bg-status-settled/15 text-status-settled border-status-settled/30' },
  POSTPONED:          { label: 'Hoãn',          className: 'bg-status-postponed/15 text-status-postponed border-status-postponed/30' },
  ABANDONED:          { label: 'Hủy',           className: 'bg-pitch-700 text-slate-400 border-pitch-600' },
  VOID:               { label: 'Vô Hiệu',       className: 'bg-status-void/50 text-slate-500 border-pitch-600 line-through' },
}

export function StatusBadge({ status }: { status: MatchStatus }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-pill text-xs font-semibold border', cfg.className)}>
      {cfg.label}
    </span>
  )
}
```

---

### 4.5 BetSelector (Prediction Picker)

```tsx
// components/matches/BetSelector.tsx
'use client'
import { cn } from '@/lib/utils/cn'
import type { BetPrediction } from '@/types'

const OPTIONS: { value: BetPrediction; label: string; shortLabel: string }[] = [
  { value: 'HOME_WIN', label: 'Chủ Nhà Thắng', shortLabel: '1' },
  { value: 'DRAW',     label: 'Hòa',            shortLabel: 'X' },
  { value: 'AWAY_WIN', label: 'Đội Khách Thắng',shortLabel: '2' },
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
```

---

### 4.6 MatchCard

```tsx
// components/matches/MatchCard.tsx
import { Card, CardBody } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/Badge'
import type { Match } from '@/types'
import { format } from 'date-fns'

export function MatchCard({ match }: { match: Match }) {
  const kickoff = new Date(match.match_datetime)
  return (
    <Card className="hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200">
      <CardBody>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-slate-500 font-medium">{match.round.name}</span>
          <StatusBadge status={match.status} />
        </div>

        {/* Score Row */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 my-4">
          <div className="text-right">
            <div className="text-2xl">{match.home_team.flag_emoji}</div>
            <div className="font-display text-section text-white leading-tight">{match.home_team.name}</div>
          </div>

          <div className="text-center flex flex-col items-center gap-1">
            {match.status === 'SETTLED' ? (
              <span className="font-display text-score text-neon text-neon-glow">
                {match.home_score} – {match.away_score}
              </span>
            ) : (
              <>
                <span className="font-display text-hero text-slate-600">VS</span>
                <span className="text-xs text-slate-500">{format(kickoff, 'HH:mm')}</span>
                <span className="text-xs text-slate-600">{format(kickoff, 'dd/MM/yyyy')}</span>
              </>
            )}
          </div>

          <div className="text-left">
            <div className="text-2xl">{match.away_team.flag_emoji}</div>
            <div className="font-display text-section text-white leading-tight">{match.away_team.name}</div>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}
```

---

### 4.7 LeaderboardRow

```tsx
// components/leaderboard/PlayerRow.tsx
import { cn } from '@/lib/utils/cn'
import type { LeaderboardEntry } from '@/types'

const RANK_STYLES: Record<number, string> = {
  1: 'text-gold font-display text-2xl text-gold-glow',
  2: 'text-slate-300 font-display text-xl',
  3: 'text-amber-600 font-display text-xl',
}

export function PlayerRow({ entry, isCurrentUser }: { entry: LeaderboardEntry; isCurrentUser: boolean }) {
  return (
    <div className={cn(
      'grid grid-cols-[48px_1fr_auto_auto] items-center gap-4 px-5 py-3.5',
      'border-b border-pitch-700 last:border-0 transition-colors duration-200',
      isCurrentUser && 'bg-neon-glow',
      entry.rank <= 3 && 'animate-rank-change',
    )}>
      <span className={cn('text-center', RANK_STYLES[entry.rank] ?? 'text-slate-500 text-sm')}>
        {entry.rank <= 3 ? ['🥇','🥈','🥉'][entry.rank - 1] : `#${entry.rank}`}
      </span>

      <div className="min-w-0">
        <p className={cn('font-semibold truncate', isCurrentUser ? 'text-neon' : 'text-white')}>
          {entry.display_name} {isCurrentUser && <span className="text-xs text-neon/70">(Bạn)</span>}
        </p>
        <p className="text-xs text-slate-500">
          {entry.correct_count}W · {entry.wrong_count}L
          {entry.current_streak > 1 && ` · 🔥 ${entry.current_streak} liên tiếp`}
        </p>
      </div>

      <div className="text-right">
        <p className="font-mono text-sm font-bold text-result-lose">+{entry.total_penalty_points}</p>
        <p className="text-xs text-slate-600">điểm phạt</p>
      </div>
    </div>
  )
}
```

---

## Part 5 — Typography Scale Reference

| Token | Class | Use |
|---|---|---|
| Display / Score | `font-display text-score` | Score board numbers |
| Display / Hero | `font-display text-hero` | Match VS separator, page headers |
| Display / Section | `font-display text-section` | Team names, section titles |
| Body / Large | `font-body text-lg font-semibold` | Card titles |
| Body / Base | `font-body text-sm` | General content |
| Body / Small | `font-body text-xs text-slate-400` | Labels, timestamps, metadata |
| Mono / Stats | `font-mono text-sm font-bold` | Scores, penalty points, rankings |

---

## Part 6 — Utility: `cn()` helper

```typescript
// lib/utils/cn.ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
```

Dependencies: `npm install clsx tailwind-merge class-variance-authority`
