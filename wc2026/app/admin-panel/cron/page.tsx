'use client'

import { useState } from 'react'

type CronJob = {
  name: string
  description: string
  lastRun: string | null
  lastResult: 'success' | 'failed' | null
  processed: number | null
}

type CronResponse = { processed?: number; error?: string }

export default function CronManagementPage() {
  const [jobs, setJobs] = useState<CronJob[]>([
    { name: 'settle_past_matches', description: 'Settle matches past their datetime', lastRun: null, lastResult: null, processed: null },
    { name: 'void_postponed_matches', description: 'Void postponed matches older than 24h', lastRun: null, lastResult: null, processed: null },
    { name: 'recalculate_leaderboard', description: 'Recalculate all leaderboard scores', lastRun: null, lastResult: null, processed: null },
  ])
  const [loading, setLoading] = useState<string | null>(null)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  async function runJob(jobName: string) {
    setLoading(jobName)
    setResult(null)

    try {
      const response = await fetch(`/api/cron/${jobName.replace('_', '/')}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${''}` },
      })

      const data: CronResponse = await response.json()

      if (response.ok) {
        setResult({ success: true, message: `Job completed: ${data.processed ?? 0} items processed` })
        setJobs(prev => prev.map(j => j.name === jobName ? { ...j, lastRun: new Date().toISOString(), lastResult: 'success', processed: data.processed ?? null } : j))
      } else {
        setResult({ success: false, message: `Job failed: ${data.error || 'Unknown error'}` })
        setJobs(prev => prev.map(j => j.name === jobName ? { ...j, lastRun: new Date().toISOString(), lastResult: 'failed' } : j))
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unknown error'
      setResult({ success: false, message: `Error: ${message}` })
      setJobs(prev => prev.map(j => j.name === jobName ? { ...j, lastRun: new Date().toISOString(), lastResult: 'failed' } : j))
    }

    setLoading(null)
  }

  async function runAllJobs() {
    setLoading('all')
    setResult(null)

    try {
      const response = await fetch('/api/cron/all', {
        method: 'POST',
        headers: { Authorization: `Bearer ${''}` },
      })

      const data: CronResponse = await response.json()

      if (response.ok) {
        setResult({ success: true, message: `All jobs completed successfully` })
      } else {
        setResult({ success: false, message: `Some jobs failed: ${data.error || 'Unknown error'}` })
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unknown error'
      setResult({ success: false, message: `Error: ${message}` })
    }

    setLoading(null)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <a href="/admin-panel/matches" className="text-neon text-sm hover:underline">← Quay lại</a>
      </div>

      <h1 className="font-display text-2xl text-gold mb-2">CRON JOBS</h1>
      <p className="text-slate-500 text-sm mb-6">Quản lý các tác vụ tự động</p>

      {result && (
        <div className={`mb-6 p-4 rounded-card border ${result.success ? 'bg-neon/10 border-neon/30 text-neon' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
          {result.message}
        </div>
      )}

      <div className="bg-pitch-800 rounded-card border border-pitch-600 overflow-hidden mb-6">
        <div className="p-4 border-b border-pitch-600">
          <h2 className="font-bold text-slate-300 mb-1">Cấu hình</h2>
          <p className="text-slate-500 text-sm">
            Thêm <code className="bg-pitch-700 px-1 rounded text-neon">CRON_SECRET=your_secret_token</code> vào .env.local
          </p>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {jobs.map((job) => (
          <div key={job.name} className="bg-pitch-800 rounded-card p-4 border border-pitch-600">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-mono text-white">{job.name}</h3>
                <p className="text-slate-500 text-sm mt-1">{job.description}</p>
              </div>
              <button
                onClick={() => runJob(job.name)}
                disabled={loading !== null}
                className="px-4 py-2 bg-neon text-pitch-950 rounded-chip font-bold text-sm hover:bg-neon-dim transition-colors disabled:opacity-50"
              >
                {loading === job.name ? '⏳' : '▶ Run'}
              </button>
            </div>
            {job.lastRun && (
              <div className="flex gap-4 text-xs text-slate-500">
                <span>Last run: {new Date(job.lastRun).toLocaleString('vi-VN')}</span>
                <span className={job.lastResult === 'success' ? 'text-neon' : 'text-red-400'}>
                  Result: {job.lastResult}
                </span>
                {job.processed !== null && <span>Processed: {job.processed}</span>}
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={runAllJobs}
        disabled={loading !== null}
        className="w-full h-12 bg-yellow-500 text-pitch-950 font-bold rounded-pill hover:bg-yellow-400 transition-colors disabled:opacity-50"
      >
        {loading === 'all' ? '⏳ Running all...' : '⚡ RUN ALL JOBS'}
      </button>
    </div>
  )
}