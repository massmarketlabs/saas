import { integer, jsonb, pgTable, text, uuid } from 'drizzle-orm/pg-core'
import { audit_fields } from './shared'

export const evaluation = pgTable('evaluation', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').unique(),
  version: integer('version'),
  form: jsonb('form'),
  ...audit_fields
})
