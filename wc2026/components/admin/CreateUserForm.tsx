'use client'

import { useState } from 'react'
import { createUser } from '@/lib/actions/user.actions'

export function CreateUserForm() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const displayName = formData.get('display_name') as string
    const role = formData.get('role') as string

    const result = await createUser(email, password, displayName, role)

    if (!result.success) {
      setError(result.error ?? 'Unknown error')
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
    window.location.href = '/admin-panel/users'
  }

  if (success) {
    return (
      <div className="p-6 bg-neon/10 border border-neon rounded-card text-center">
        <p className="text-neon font-bold">✓ User đã được tạo thành công!</p>
        <a href="/admin-panel/users" className="text-neon hover:underline mt-2 inline-block">
          ← Quay lại danh sách
        </a>
      </div>
    )
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-chip text-red-400 text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm text-slate-400 mb-1">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          required
          className="w-full px-4 py-2 bg-pitch-700 border border-pitch-600 rounded-chip text-white focus:border-neon focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm text-slate-400 mb-1">Mật khẩu</label>
        <input
          type="password"
          id="password"
          name="password"
          required
          minLength={6}
          className="w-full px-4 py-2 bg-pitch-700 border border-pitch-600 rounded-chip text-white focus:border-neon focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="display_name" className="block text-sm text-slate-400 mb-1">Tên hiển thị</label>
        <input
          type="text"
          id="display_name"
          name="display_name"
          required
          className="w-full px-4 py-2 bg-pitch-700 border border-pitch-600 rounded-chip text-white focus:border-neon focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="role" className="block text-sm text-slate-400 mb-1">Role</label>
        <select
          id="role"
          name="role"
          required
          className="w-full px-4 py-2 bg-pitch-700 border border-pitch-600 rounded-chip text-white focus:border-neon focus:outline-none"
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
          <option value="superuser">Superuser</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full h-12 bg-neon text-pitch-950 font-bold rounded-pill hover:bg-neon-dim transition-colors disabled:opacity-50"
      >
        {loading ? 'Đang tạo...' : 'TẠO USER'}
      </button>
    </form>
  )
}