// Run with: npx tsx --env-file=.env.local scripts/seed-reset.ts

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function main() {
  console.log('🗑️  WC2026 Data Reset\n')

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.warn('⚠️  Missing Supabase env vars.')
    console.log('   Use supabase/seeds/reset_data.sql in Supabase SQL Editor instead.\n')
    return
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  // Test connection
  const { error: pingError } = await supabase.from('teams').select('id').limit(1)
  if (pingError) {
    console.warn('⚠️  Supabase connection failed:', pingError.message)
    console.log('   Use supabase/seeds/reset_data.sql in Supabase SQL Editor instead.\n')
    return
  }

  console.log('✅ Connected to Supabase.\n')
  console.log('Deleting all bets...')
  const { error: err1, count: c1 } = await supabase.from('bets').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  if (err1) { console.error('  ❌', err1.message) }
  else { console.log('  ✅ Bets cleared') }

  console.log('Deleting all matches...')
  const { error: err2 } = await supabase.from('matches').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  if (err2) { console.error('  ❌', err2.message) }
  else { console.log('  ✅ Matches cleared') }

  console.log('Deleting all teams...')
  const { error: err3 } = await supabase.from('teams').delete().neq('id', 0)
  if (err3) { console.error('  ❌', err3.message) }
  else { console.log('  ✅ Teams cleared') }

  console.log('\n✨ Reset complete! Run `npm run seed` to re-seed.')
}

main().catch((e) => { console.error('Fatal:', e); process.exit(1) })
