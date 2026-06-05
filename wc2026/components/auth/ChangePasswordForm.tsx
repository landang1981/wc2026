'use client'
import { useActionState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardBody } from '@/components/ui/Card'
import { changePassword } from '@/lib/actions/auth.actions'

export function ChangePasswordForm() {
  const [state, formAction, isPending] = useActionState(changePassword, null)

  return (
    <Card className="w-full max-w-md" glow="neon">
      <CardBody>
        <div className="text-center mb-8">
          <h1 className="font-display text-section text-white mb-2">ĐỔI MẬT KHẨU</h1>
          <p className="text-slate-400 text-sm">Mật khẩu phải có ít nhất 8 ký tự</p>
        </div>

        <form action={formAction} className="space-y-5">
          <Input name="new_password" type="password" label="Mật khẩu mới" placeholder="••••••••" required />
          <Input name="confirm_password" type="password" label="Xác nhận mật khẩu" placeholder="••••••••" required />
          {state?.error && <p className="text-result-lose text-sm text-center">{state.error}</p>}
          <Button type="submit" className="w-full" size="lg" isLoading={isPending}>
            CẬP NHẬT
          </Button>
        </form>
      </CardBody>
    </Card>
  )
}