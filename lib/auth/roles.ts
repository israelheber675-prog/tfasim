// Role hierarchy: admin > supervisor > paramedic > emt
export type UserRole = 'admin' | 'supervisor' | 'paramedic' | 'emt'

const ROLE_LEVEL: Record<UserRole, number> = {
  admin:      40,
  supervisor: 30,
  paramedic:  20,
  emt:        10,
}

export const ROLE_LABELS: Record<UserRole, string> = {
  admin:      'מנהל מערכת',
  supervisor: 'מפקח / ראש תחנה',
  paramedic:  'פרמדיק',
  emt:        'חובש',
}

export function hasMinRole(userRole: UserRole | undefined, minRole: UserRole): boolean {
  if (!userRole) return false
  return (ROLE_LEVEL[userRole] ?? 0) >= ROLE_LEVEL[minRole]
}

// Permissions
export const PERMISSIONS = {
  // Anyone logged in
  createCall:    'emt' as UserRole,
  editOwnCall:   'emt' as UserRole,
  downloadPdf:   'emt' as UserRole,
  viewCallList:  'emt' as UserRole,

  // Supervisor+
  viewAllCalls:  'supervisor' as UserRole,
  editAnyCall:   'supervisor' as UserRole,
  viewDashboard: 'supervisor' as UserRole,
  exportData:    'supervisor' as UserRole,

  // Admin only
  manageUsers:   'admin' as UserRole,
  viewAuditLog:  'admin' as UserRole,
  changeSettings:'admin' as UserRole,
} as const

export type Permission = keyof typeof PERMISSIONS

export function can(userRole: UserRole | undefined, permission: Permission): boolean {
  return hasMinRole(userRole, PERMISSIONS[permission])
}
