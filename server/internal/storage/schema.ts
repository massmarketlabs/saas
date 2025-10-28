import { integer, pgTable, text, uuid } from 'drizzle-orm/pg-core'
import { audit_fields } from '../../utils/auditFields'

export const storage = pgTable('storage', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  size: integer('size').notNull(),
  path: text('path').notNull(),
  bucket: text('bucket').notNull(),
  mime_type: text('mime_type'),
  ...audit_fields
})
