import { createAccessControl } from 'better-auth/plugins/access'
import { adminAc, defaultStatements } from 'better-auth/plugins/admin/access'

export const statement = {
  ...defaultStatements,
  beneficiary: ['create', 'update', 'delete'] // <-- Permissions available for created roles
} as const

export const ac = createAccessControl(statement)

export const user = ac.newRole({
  beneficiary: ['create']
})

export const admin = ac.newRole({
  beneficiary: ['create', 'update', 'delete'],
  ...adminAc.statements
})

export const project_manager = ac.newRole({
  beneficiary: ['create', 'update'],
  user: ['ban']
})

export const owner = ac.newRole({
  beneficiary: ['create', 'delete', 'update'],
  user: ['ban', 'create', 'delete', 'impersonate', 'list', 'set-password', 'set-role'],
  session: ['delete', 'list', 'revoke']
})
