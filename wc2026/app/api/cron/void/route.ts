import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server'
import { voidPostponedMatches } from '@/lib/actions/cron.actions'

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const result = await voidPostponedMatches()

  return NextResponse.json({
    job: 'void_postponed_matches',
    timestamp: new Date().toISOString(),
    ...result,
  }, { status: result.success ? 200 : 500 })
}