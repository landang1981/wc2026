'use server'
import { redirect } from 'next/navigation'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import type { UserRole } from '@/types'

export async function RoleGuard({
  allowedRoles,
  children,
}: {
  allowedRoles: UserRole[]
  children: React.ReactNode
}) {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile?.role || !allowedRoles.includes(profile.role)) {
    redirect('/matches')
  }

  return <>{children}</>
}