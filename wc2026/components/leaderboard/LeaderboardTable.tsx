'use client'
import { useEffect, useState } from 'react'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { PlayerRow } from './PlayerRow'
import type { LeaderboardEntry } from '@/types'

type LeaderboardTableProps = {
  initialData?: LeaderboardEntry[]
  currentUserId?: string
}

export function LeaderboardTable({ initialData = [], currentUserId }: LeaderboardTableProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>(initialData)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch('/api/leaderboard')
        if (res.ok) {
          const data = await res.json()
          setEntries(data.data)
          setLastUpdated(new Date())
        }
      } catch (_err) {
        // Silently fail - use cached data
      }
    }

    fetchLeaderboard()
    const interval = setInterval(fetchLeaderboard, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Card glow="gold">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-section text-gold">BẢNG XẾP HẠNG</h2>
          {lastUpdated && (
            <span className="text-xs text-slate-500">
              Cập nhật: {lastUpdated.toLocaleTimeString('vi-VN')}
            </span>
          )}
        </div>
      </CardHeader>
      <CardBody className="p-0">
        <div className="divide-y divide-pitch-700">
          {entries.length === 0 ? (
            <p className="text-center text-slate-500 py-8">Chưa có dữ liệu</p>
          ) : (
            entries.map((entry) => (
              <PlayerRow key={entry.user_id} entry={entry} isCurrentUser={entry.user_id === currentUserId} />
            ))
          )}
        </div>
      </CardBody>
    </Card>
  )
}