import { redirect } from 'next/navigation'
import { ChangePasswordForm } from '@/components/auth/ChangePasswordForm'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export default async function ChangePasswordPage() {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('must_change_password')
    .eq('id', user.id)
    .single()

  if (profile && !profile.must_change_password) {
    redirect('/matches')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-stadium-gradient">
      <ChangePasswordForm />
    </div>
  )
}