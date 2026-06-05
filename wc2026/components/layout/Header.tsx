'use client'
import Link from 'next/link'

type HeaderProps = {
  user?: { display_name?: string; role?: string } | undefined
  showDebugBanner?: boolean
}

export function Header({ user, showDebugBanner }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-pitch-950/95 backdrop-blur border-b border-pitch-700">
      {showDebugBanner && (
        <div className="bg-amber-500/10 text-amber-500 text-xs text-center py-1">
          🔧 Development Mode
        </div>
      )}
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/matches" className="flex items-center gap-2">
          <span className="font-display text-xl text-neon">WC2026</span>
          <span className="font-display text-xl text-white">BETS</span>
        </Link>

        <div className="flex items-center gap-3">
          {user?.display_name && (
            <Link href="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-7 h-7 rounded-full bg-pitch-700 flex items-center justify-center text-xs">
                {user.display_name?.charAt(0).toUpperCase() || '👤'}
              </div>
              <span className="text-sm text-slate-400 hidden sm:inline">{user.display_name}</span>
            </Link>
          )}
          {user?.role && user.role !== 'user' && (
            <span className="px-2 py-0.5 text-xs rounded-pill bg-pitch-700 text-neon border border-neon/30">
              {user.role === 'admin' ? 'Admin' : 'Superuser'}
            </span>
          )}
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="text-xs text-slate-500 hover:text-result-lose transition-colors px-2 py-1"
            >
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </header>
  )
}