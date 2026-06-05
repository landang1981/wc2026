'use server'
import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

async function getAuthClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component
          }
        },
      },
    }
  )
}

async function getServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  )
}

type AuthState = { error: string } | null

export async function login(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  const supabase = await getAuthClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: error.message }

  const { data: profile } = await supabase
    .from('profiles')
    .select('must_change_password')
    .eq('id', data.user.id)
    .single()

  if (profile?.must_change_password) {
    redirect('/change-password')
  }
  redirect('/matches')
}

export async function changePassword(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  const newPassword = formData.get('new_password') as string
  const confirmPassword = formData.get('confirm_password') as string

  if (newPassword !== confirmPassword) {
    return { error: 'Mật khẩu không khớp' }
  }
  if (newPassword.length < 8) {
    return { error: 'Mật khẩu phải có ít nhất 8 ký tự' }
  }

  const supabase = await getAuthClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: 'Unauthorized' }

  const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })
  if (updateError) return { error: updateError.message }

  await supabase.from('profiles').update({ must_change_password: false }).eq('id', user.id)
  redirect('/matches')
}

export async function signOut() {
  const supabase = await getAuthClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function createUser(formData: FormData) {
  const supabaseAdmin = await getServiceClient()
  const supabase = await getAuthClient()

  const { data: { user: currentUser } } = await supabase.auth.getUser()
  if (!currentUser) return { error: 'Unauthorized' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', currentUser.id)
    .single()

  if (profile?.role !== 'admin') return { error: 'Admin only' }

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const displayName = formData.get('display_name') as string
  const role = formData.get('role') as 'user' | 'superuser'

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: displayName, role },
  })

  if (error) return { error: error.message }
  return { success: true, userId: data.user.id }
}