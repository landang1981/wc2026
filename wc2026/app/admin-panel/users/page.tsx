import { getSupabaseServerClient } from '@/lib/supabase/server'
import { RoleBadge } from '@/components/ui/Badge'
import { DeleteUserButton } from '@/components/admin/DeleteUserButton'
import { redirect } from 'next/navigation'

type UserRow = {
  id: string
  display_name: string | null
  role: string
  created_at: string
}

export default async function UsersPage() {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/admin-panel/matches')

  const { data: users, error } = await supabase
    .from('profiles')
    .select('id, display_name, role, created_at')
    .order('created_at', { ascending: false })

  const typedUsers = (users ?? []) as UserRow[]

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-display text-2xl text-gold">QUẢN LÝ USERS</h1>
        <a href="/admin-panel/users/new" className="px-4 py-2 bg-neon text-pitch-950 rounded-chip font-bold hover:bg-neon-dim transition-colors">
          + Tạo User mới
        </a>
      </div>

      <div className="bg-pitch-800 rounded-card border border-pitch-600 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-pitch-600 text-left text-sm text-slate-500">
              <th className="p-4 font-medium">Email / Name</th>
              <th className="p-4 font-medium">Role</th>
              <th className="p-4 font-medium">Ngày tạo</th>
              <th className="p-4 font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {typedUsers.length > 0 ? (
              typedUsers.map(u => (
                <tr key={u.id} className="border-b border-pitch-700 last:border-0">
                  <td className="p-4">
                    <p className="text-white">{u.display_name || 'N/A'}</p>
                    <p className="text-xs text-slate-500">{u.id}</p>
                  </td>
                  <td className="p-4">
                    <RoleBadge role={u.role} />
                  </td>
                  <td className="p-4 text-slate-400 text-sm">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString('vi-VN') : 'N/A'}
                  </td>
                  <td className="p-4">
                    <DeleteUserButton userId={u.id} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-500">Chưa có user nào</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {error && (
        <p className="mt-4 text-red-400 text-center">Lỗi: {error.message}</p>
      )}
    </div>
  )
}