'use client'

export function DeleteUserButton({ userId }: { userId: string }) {
  return (
    <form
      action={`/api/admin/users/${userId}/delete`}
      method="POST"
      onSubmit={(e) => {
        if (!confirm('Xóa user này?')) e.preventDefault()
      }}
    >
      <button
        type="submit"
        className="text-red-400 text-sm hover:text-red-300 transition-colors"
      >
        🗑️ Xóa
      </button>
    </form>
  )
}
