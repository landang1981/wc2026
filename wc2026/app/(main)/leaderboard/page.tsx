import { getSupabaseServerClient } from '@/lib/supabase/server'
import { LeaderboardTable } from '@/components/leaderboard/LeaderboardTable'
import type { LeaderboardEntry } from '@/types'

async function getLeaderboard(): Promise<{ entries: LeaderboardEntry[]; currentUserId: string }> {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  const currentUserId = user?.id ?? ''

  // Only show leaderboard with real data (users who have settled bets)
  const { data, error } = await supabase
    .from('leaderboard')
    .select('*')
    .order('rank', { ascending: true })

  if (!error && data && data.length > 0) {
    const hasRealStats = data.some(
      (e: LeaderboardEntry) => e.correct_count > 0 || e.wrong_count > 0 || e.total_penalty_points > 0
    )
    if (hasRealStats) {
      return { entries: data, currentUserId }
    }
  }

  // No real data yet - return empty so we show "Chưa có dữ liệu"
  return { entries: [], currentUserId }
}

export default async function LeaderboardPage() {
  const { entries, currentUserId } = await getLeaderboard()

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="font-display text-hero text-gold mb-2">BẢNG XẾP HẠNG</h1>
        <p className="text-slate-500 text-sm">Thứ hạng dựa trên điểm phạt thấp nhất</p>
      </div>

      <LeaderboardTable initialData={entries} currentUserId={currentUserId} />
    </div>
  )
}

