'use server'

import { getSupabaseServerClient } from '@/lib/supabase/server'
import { createServerClient } from '@supabase/ssr'
import { revalidatePath } from 'next/cache'

// Use service role key for admin operations (bypasses RLS)
function getServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  )
}

export interface CreateUserResult {
  success: boolean
  error?: string
  userId?: string
}

export async function createUser(
  email: string,
  password: string,
  displayName: string,
  role: string
): Promise<CreateUserResult> {
  const serviceClient = getServiceClient()
  const supabase = await getSupabaseServerClient()

  // Verify the current user is admin/superuser
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  if (!currentUser) return { success: false, error: 'Unauthorized' }

  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', currentUser.id)
    .single()

  if (!currentProfile || currentProfile.role !== 'admin') {
    return { success: false, error: 'User not allowed' }
  }

  // Create user via service client - the DB trigger handle_new_user
  // will automatically create the profile row from user_metadata
  const { data, error } = await serviceClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: displayName, role },
  })

  if (error) {
    // Check if error is due to duplicate email
    if (error.message?.toLowerCase().includes('already registered') || 
        error.message?.toLowerCase().includes('already exists') ||
        error.message?.toLowerCase().includes('duplicate')) {
      return { success: false, error: 'Email đã được sử dụng' }
    }
    return { success: false, error: error.message }
  }
  if (!data?.user) return { success: false, error: 'User creation returned no user object' }

  // The trigger handle_new_user should have created the profile.
  // If not, manually insert.
  const { data: existingProfile } = await serviceClient
    .from('profiles')
    .select('id')
    .eq('id', data.user.id)
    .maybeSingle()

  if (!existingProfile) {
    const { error: insertError } = await serviceClient.from('profiles').insert({
      id: data.user.id,
      username: email,
      display_name: displayName,
      role,
    })
    if (insertError) {
      await serviceClient.auth.admin.deleteUser(data.user.id)
      return { success: false, error: `Database error: ${insertError.message}` }
    }
  }

  revalidatePath('/admin-panel/users')
  return { success: true, userId: data.user.id }
}

export interface UpdateUserRoleResult {
  success: boolean
  error?: string
}

export async function updateUserRole(
  userId: string,
  newRole: string
): Promise<UpdateUserRoleResult> {
  const supabase = await getSupabaseServerClient()

  const { error } = await supabase
    .from('profiles')
    .update({ role: newRole, updated_at: new Date().toISOString() })
    .eq('id', userId)

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin-panel/users')
  return { success: true }
}

export interface DeleteUserResult {
  success: boolean
  error?: string
}

export async function deleteUser(userId: string): Promise<DeleteUserResult> {
  const supabase = await getSupabaseServerClient()

  const { error: profileError } = await supabase.from('profiles').delete().eq('id', userId)
  if (profileError) return { success: false, error: profileError.message }

  const { error: authError } = await supabase.auth.admin.deleteUser(userId)
  if (authError) return { success: false, error: authError.message }

  revalidatePath('/admin-panel/users')
  return { success: true }
}

