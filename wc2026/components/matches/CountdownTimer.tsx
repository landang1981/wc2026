'use client'
import { useEffect, useState } from 'react'
import { differenceInSeconds } from 'date-fns'

type CountdownTimerProps = {
  targetDate: string
  onComplete?: () => void
}

export function CountdownTimer({ targetDate, onComplete }: CountdownTimerProps) {
  const target = new Date(targetDate)
  const [secondsLeft, setSecondsLeft] = useState(0)

  useEffect(() => {
    const update = () => {
      const diff = differenceInSeconds(target, new Date())
      setSecondsLeft(Math.max(0, diff))
      if (diff <= 0) onComplete?.()
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [target, onComplete])

  if (secondsLeft === 0) return null

  const hours = Math.floor(secondsLeft / 3600)
  const minutes = Math.floor((secondsLeft % 3600) / 60)
  const seconds = secondsLeft % 60

  return (
    <div className="flex items-center gap-1 font-mono text-sm">
      <span className="text-neon">{hours.toString().padStart(2, '0')}</span>
      <span className="text-slate-500">:</span>
      <span className="text-neon">{minutes.toString().padStart(2, '0')}</span>
      <span className="text-slate-500">:</span>
      <span className="text-neon">{seconds.toString().padStart(2, '0')}</span>
    </div>
  )
}

export function MatchTime({ datetime }: { datetime: string }) {
  const date = new Date(datetime)
  const timeStr = date.toLocaleString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
  return (
    <div className="text-center">
      <span className="font-display text-hero text-slate-600">VS</span>
      <p className="text-xs text-slate-400 mt-1 font-mono">{timeStr}</p>
    </div>
  )
}