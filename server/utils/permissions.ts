import { createAccessControl } from 'better-auth/plugins/access'
import { adminAc, defaultStatements } from 'better-auth/plugins/admin/access'

export const statement = {
  ...defaultStatements,
  assignment: ['create', 'read', 'update', 'delete']
} as const

export const ac = createAccessControl(statement)

export const beneficiary = ac.newRole({
  user: ['list']
})

export const admin = ac.newRole({
  ...adminAc.statements
})

export const instructor = ac.newRole({
  user: ['list'],
  assignment: ['create', 'read', 'update', 'delete']
})
