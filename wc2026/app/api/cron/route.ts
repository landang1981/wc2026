import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server'
import { settlePastMatches } from '@/lib/actions/cron.actions'
import { voidPostponedMatches } from '@/lib/actions/cron.actions'
import { recalculateLeaderboard } from '@/lib/actions/cron.actions'

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [settleResult, voidResult, recalcResult] = await Promise.all([
    settlePastMatches(),
    voidPostponedMatches(),
    recalculateLeaderboard(),
  ])

  const allSuccess = settleResult.success && voidResult.success && recalcResult.success

  return NextResponse.json({
    job: 'run_all_crons',
    timestamp: new Date().toISOString(),
    results: {
      settle_past_matches: settleResult,
      void_postponed_matches: voidResult,
      recalculate_leaderboard: recalcResult,
    },
    all_success: allSuccess,
  }, { status: allSuccess ? 200 : 500 })
}

export async function GET() {
  return NextResponse.json({
    available_jobs: [
      { path: '/api/cron/settle', method: 'POST', description: 'Settle matches past their datetime' },
      { path: '/api/cron/void', method: 'POST', description: 'Void postponed matches older than 24h' },
      { path: '/api/cron/recalculate', method: 'POST', description: 'Recalculate all leaderboard scores' },
      { path: '/api/cron/all', method: 'POST', description: 'Run all cron jobs' },
    ],
    authentication: 'Bearer token in CRON_SECRET env variable',
  })
}