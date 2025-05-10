import { timestamp } from 'drizzle-orm/pg-core'

export const audit_fields = {
  created_at: timestamp('created_at', { mode: 'string', withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { mode: 'string', withTimezone: true }).defaultNow().notNull(),
  deleted_at: timestamp('deleted_at', { mode: 'string', withTimezone: true })
}
