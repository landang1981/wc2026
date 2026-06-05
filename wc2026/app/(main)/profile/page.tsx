import { getSupabaseServerClient } from '@/lib/supabase/server'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { RoleBadge } from '@/components/ui/Badge'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function ProfilePage() {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  let { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Auto-create profile if missing (e.g. trigger didn't fire)
  if (!profile) {
    const { data: newProfile } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        username: user.email ?? user.id,
        display_name: user.user_metadata?.display_name ?? user.email?.split('@')[0] ?? 'User',
        role: 'user',
        must_change_password: false,
      })
      .select()
      .single()
    profile = newProfile
  }

  if (!profile) {
    return <div className="text-center py-12 text-slate-400">Không tìm thấy thông tin người dùng</div>
  }

  const createdDate = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'N/A'

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="font-display text-hero text-neon mb-2">PROFILE</h1>
        <p className="text-slate-500 text-sm">Thông tin tài khoản của bạn</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-pitch-700 flex items-center justify-center text-2xl">
              {profile.display_name?.charAt(0).toUpperCase() || '👤'}
            </div>
            <div>
              <h2 className="font-display text-section text-white">{profile.display_name}</h2>
              <p className="text-slate-400 text-sm">{profile.username}</p>
            </div>
            <div className="ml-auto">
              <RoleBadge role={profile.role} />
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            <div className="flex justify-between py-2 border-b border-pitch-700">
              <span className="text-slate-400">Email</span>
              <span className="text-white">{profile.username}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-pitch-700">
              <span className="text-slate-400">Vai trò</span>
              <span className="text-white capitalize">{profile.role}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-pitch-700">
              <span className="text-slate-400">Ngày tham gia</span>
              <span className="text-white">{createdDate}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-400">Đổi mật khẩu</span>
              <Link href="/change-password" className="text-neon hover:underline text-sm">
                Đổi mật khẩu →
              </Link>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-pitch-700 space-y-3">
            
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="flex items-center gap-2 text-sm text-result-lose hover:text-red-300 transition-colors"
              >
                🚪 Sign Out
              </button>
            </form>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
