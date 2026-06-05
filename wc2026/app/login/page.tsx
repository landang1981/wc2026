import { redirect } from 'next/navigation'
import { LoginForm } from '@/components/auth/LoginForm'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export default async function LoginPage() {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) redirect('/matches')

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-stadium-gradient">
      <LoginForm />
    </div>
  )
}