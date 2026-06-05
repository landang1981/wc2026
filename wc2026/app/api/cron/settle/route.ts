import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server'
import { settlePastMatches } from '@/lib/actions/cron.actions'

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const result = await settlePastMatches()

  return NextResponse.json({
    job: 'settle_past_matches',
    timestamp: new Date().toISOString(),
    ...result,
  }, { status: result.success ? 200 : 500 })
}