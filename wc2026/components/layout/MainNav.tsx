'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'

type MainNavProps = {
  user?: { display_name?: string; role?: string } | undefined
}

const PLAYER_NAV = [
  { href: '/matches', label: 'Matches', icon: '⚽' },
  { href: '/my-bets', label: 'My Bets', icon: '🎯' },
  { href: '/leaderboard', label: 'Leader Board', icon: '🏆' },
  { href: '/profile', label: 'Profile', icon: '👤' },
]

const ADMIN_NAV = { href: '/admin-panel/users', label: 'Quản lý Users', icon: '👥' }
const MATCHES_NAV = { href: '/admin-panel/matches', label: 'Quản lý Trận đấu', icon: '⚙️' }

export function MainNav({ user }: MainNavProps) {
  const pathname = usePathname()
  const role = user?.role

  const navItems = [
    ...PLAYER_NAV,
    ...(role === 'admin' ? [ADMIN_NAV] : []),
    ...(role === 'admin' || role === 'superuser' ? [MATCHES_NAV] : []),
  ]

  return (
    <aside className="w-64 border-r border-pitch-700 bg-pitch-900 relative">
      <div className="p-4">
        <div className="mb-6">
          <Link href="/matches" className="flex items-center gap-2">
            <span className="font-display text-xl text-neon">WC2026</span>
            <span className="font-display text-xl text-white">BETS</span>
          </Link>
        </div>

        <nav className="space-y-1">
          {navItems.map(item => {
            // Exact match to avoid "Matches" highlighting when on "My Bets"
            const isActive =
              pathname === item.href ||
              (item.href !== '/' && pathname.startsWith(item.href + '/'))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-chip transition-all',
                  isActive
                    ? 'bg-neon/10 text-neon border border-neon/30'
                    : 'text-slate-400 hover:text-white hover:bg-pitch-800'
                )}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-pitch-700">
        <div className="flex flex-col gap-2">
          {user?.display_name && (
            <div className="px-4 py-2 text-xs text-slate-500 truncate">
              {user.display_name}
              {user.role && user.role !== 'user' && (
                <span className="ml-2 text-neon">
                  ({user.role === 'admin' ? 'Admin' : 'Superuser'})
                </span>
              )}
            </div>
          )}
          <form action="/api/auth/logout" method="POST" className="w-full">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-slate-400 hover:text-white transition-colors rounded-chip hover:bg-pitch-800"
            >
              <span>🚪</span>
              <span>Logout</span>
            </button>
          </form>
        </div>
      </div>
    </aside>
  )
}