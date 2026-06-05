import { redirect } from 'next/navigation'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { MainNav } from '@/components/layout/MainNav'
import { Header } from '@/components/layout/Header'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, display_name, role')
    .eq('id', user.id)
    .single()

  const profileUser = profile
    ? { display_name: profile.display_name ?? undefined, role: profile.role ?? undefined }
    : undefined

  return (
    <div className="min-h-screen flex flex-col bg-pitch-900">
      <Header user={profileUser} showDebugBanner={process.env.NEXT_PUBLIC_SHOW_DEBUG_BANNER === 'true'} />
      <div className="flex-1 flex">
        <MainNav user={profileUser} />
        <main className="flex-1 pb-20">
          {children}
        </main>
      </div>
    </div>
  )
}
