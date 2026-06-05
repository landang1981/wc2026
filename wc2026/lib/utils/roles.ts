import type { UserRole } from '@/types'

export function hasRole(userRole: UserRole, minRole: UserRole): boolean {
  const hierarchy: UserRole[] = ['user', 'superuser', 'admin']
  const userIdx = hierarchy.indexOf(userRole)
  const minIdx = hierarchy.indexOf(minRole)
  return userIdx >= minIdx
}

export function isAdmin(role: UserRole): role is 'admin' {
  return role === 'admin'
}

export function isSuperuser(role: UserRole): role is 'superuser' {
  return role === 'superuser'
}