import { getSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CreateUserForm } from '@/components/admin/CreateUserForm'

export default async function NewUserPage() {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/admin-panel/matches')

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-6">
        <a href="/admin-panel/users" className="text-neon text-sm hover:underline">← Quay lại</a>
      </div>
      <h1 className="font-display text-2xl text-gold mb-6">TẠO USER MỚI</h1>
      <div className="bg-pitch-800 rounded-card p-6 border border-pitch-600">
        <CreateUserForm />
      </div>
    </div>
  )
}