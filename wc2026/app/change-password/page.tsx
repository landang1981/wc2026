import { redirect } from 'next/navigation'
import { ChangePasswordForm } from '@/components/auth/ChangePasswordForm'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export default async function ChangePasswordPage() {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Chỉ redirect về /matches nếu là forced change (must_change_password = true mà không phải admin)
  // Còn user tự vào từ Profile thì cho phép đổi mật khẩu bình thường
  const { data: profile } = await supabase
    .from('profiles')
    .select('must_change_password, role')
    .eq('id', user.id)
    .single()

  // Nếu profile null hoặc role là admin -> cho phép vào luôn
  // Nếu must_change_password = false (đã đổi rồi) -> vẫn cho vào (không redirect nữa)

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-stadium-gradient">
      <ChangePasswordForm />
    </div>
  )
}