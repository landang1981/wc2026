import { cn } from '@/lib/utils/cn'
import type { MatchStatus, UserRole } from '@/types'

const STATUS_CONFIG: Record<MatchStatus, { label: string; className: string }> = {
  SCHEDULED: { label: 'Sắp Diễn Ra', className: 'bg-status-scheduled/15 text-status-scheduled border-status-scheduled/30' },
  LIVE: { label: '● LIVE', className: 'bg-status-live/15 text-status-live border-status-live/30 animate-pulse-live' },
  PENDING_SETTLEMENT: { label: 'Chờ Duyệt', className: 'bg-status-pending/15 text-status-pending border-status-pending/30' },
  CONFIRMED: { label: 'Đã Xác Nhận', className: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' },
  SETTLED: { label: 'Đã Kết Thúc', className: 'bg-status-settled/15 text-status-settled border-status-settled/30' },
  POSTPONED: { label: 'Hoãn', className: 'bg-status-postponed/15 text-status-postponed border-status-postponed/30' },
  ABANDONED: { label: 'Hủy', className: 'bg-pitch-700 text-slate-400 border-pitch-600' },
  VOID: { label: 'Vô Hiệu', className: 'bg-status-void/50 text-slate-500 border-pitch-600 line-through' },
}

const ROLE_CONFIG: Record<UserRole, { label: string; className: string }> = {
  user: { label: 'User', className: 'bg-slate-500/15 text-slate-400 border-slate-500/30' },
  admin: { label: 'Admin', className: 'bg-red-500/15 text-red-400 border-red-500/30' },
  superuser: { label: 'Super', className: 'bg-neon/15 text-neon border-neon/30' },
}

export function StatusBadge({ status }: { status: MatchStatus }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-pill text-xs font-semibold border', cfg.className)}>
      {cfg.label}
    </span>
  )
}

export function RoleBadge({ role }: { role: string }) {
  const cfg = ROLE_CONFIG[role as UserRole] ?? ROLE_CONFIG.user
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-pill text-xs font-semibold border', cfg.className)}>
      {cfg.label}
    </span>
  )
}