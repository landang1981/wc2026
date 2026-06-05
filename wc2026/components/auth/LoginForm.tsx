'use client'
import { useActionState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardBody } from '@/components/ui/Card'
import { login } from '@/lib/actions/auth.actions'

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, null)

  return (
    <Card className="w-full max-w-md" glow="neon">
      <CardBody>
        <div className="text-center mb-8">
          <h1 className="font-display text-hero text-neon mb-2">WC2026 BETS</h1>
          <p className="text-slate-400 text-sm">Đăng nhập để tham gia dự đoán</p>
        </div>

        <form action={formAction} className="space-y-5">
          <Input name="email" type="email" label="Email" placeholder="email@example.com" required />
          <Input name="password" type="password" label="Mật khẩu" placeholder="••••••••" required />
          {state?.error && <p className="text-result-lose text-sm text-center">{state.error}</p>}
          <Button type="submit" className="w-full" size="lg" isLoading={isPending}>
            ĐĂNG NHẬP
          </Button>
        </form>
      </CardBody>
    </Card>
  )
}