// Script t?o user admin/superuser/user qua Supabase Admin API
// Ch?y: npx tsx --env-file=.env.local scripts/create-admin.ts

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const USERS = [
  {
    email: 'admin@wc2026.internal',
    password: 'Admin@2026',
    display_name: 'Qu?n Tr? Vi�n',
    role: 'admin' as const,
    must_change_password: false,
  },
  {
    email: 'superuser@wc2026.internal',
    password: 'Super@2026',
    display_name: 'Ng??i V?n H�nh',
    role: 'superuser' as const,
    must_change_password: false,
  },
  {
    email: 'user@wc2026.internal',
    password: 'User@2026',
    display_name: 'Ng??i Ch?i',
    role: 'user' as const,
    must_change_password: true,
  },
]

async function main() {
  console.log('🔐 Creating default users...\n')

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error('❌ Missing SUPABASE env vars. Check .env.local')
    process.exit(1)
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  for (const u of USERS) {
    console.log(`  Creating ${u.email} (${u.role})...`)

    // 1. Create user in auth.users
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: {
        display_name: u.display_name,
        role: u.role,
      },
    })

    if (authError) {
      if (authError.message.includes('already')) {
        console.log(`  ⏭️  Already exists: ${u.email}`)
        // Update profile just in case
        const { data: existing } = await supabase
          .from('profiles')
          .update({ role: u.role, must_change_password: u.must_change_password })
          .eq('username', u.email)
          .select('id')
          .single()

        if (existing) {
          console.log(`  ✅ Profile updated for ${u.email}`)
        }
        continue
      }
      console.error(`  ❌ ${u.email}: ${authError.message}`)
      continue
    }

    if (authUser?.user?.id) {
      // 2. Update profile (trigger should have created one)
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          role: u.role,
          must_change_password: u.must_change_password,
        })
        .eq('id', authUser.user.id)

      if (profileError) {
        console.error(`  ⚠️  Profile update error: ${profileError.message}`)
      }
    }

    console.log(`  ✅ Created: ${u.email}`)
  }

  console.log('\n✅ Done! You can now login:')
  console.log('   ┌──────────────────────────┬──────────────┬─────────────┐')
  console.log('   │ Email                     │ Password      │ Role        │')
  console.log('   ├──────────────────────────┼──────────────┼─────────────┤')
  console.log('   │ admin@wc2026.internal     │ Admin@2026    │ admin       │')
  console.log('   │ superuser@wc2026.internal │ Super@2026    │ superuser   │')
  console.log('   │ user@wc2026.internal      │ User@2026     │ user        │')
  console.log('   └──────────────────────────┴──────────────┴─────────────┘')
}

main().catch(console.error)
