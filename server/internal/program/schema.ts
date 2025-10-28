import { boolean, pgTable, text, uuid } from 'drizzle-orm/pg-core'
import { audit_fields } from '../../utils/auditFields'

// ========================
// Programs
// ========================
export const programs = pgTable('programs', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  is_active: boolean('is_active').default(true).notNull(),
  ...audit_fields
})
