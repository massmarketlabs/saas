import { relations } from 'drizzle-orm'
import { boolean, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core'

import { user } from './auth'
import { audit_fields } from './shared'

// ========================
// Emergency Contacts
// ========================
export const emergency_contacts = pgTable('emergency_contacts', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: text('user_id').references(() => user.id).notNull(),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  email: text('email'),
  relationship: text('relationship').notNull(),
  is_primary: boolean('is_primary').default(false), // Optional: to mark primary contact

  // Audit fields
  ...audit_fields
})

// ========================
// Relationships
// ========================
export const relationships = pgTable('relationships', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: text('user_id').references(() => user.id).notNull(),
  related_user_id: text('related_user_id').references(() => user.id).notNull(),
  relationship_type: text('relationship_type').notNull(), // parent, child, spouse, etc.

  // Audit fields
  ...audit_fields
}, table => [uniqueIndex('unq_relationship').on(
  table.user_id,
  table.related_user_id,
  table.relationship_type
)])

// ========================
// Approval Requests
// ========================
export const approval_request = pgTable('approval_request', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: text('user_id').references(() => user.id).notNull(),
  submitted_by: text('submitted_by').references(() => user.id).notNull(),
  reason: text('reason').notNull(),
  reviewed_by: text('reviewed_by').references(() => user.id),
  approved: timestamp('approved', { mode: 'string', withTimezone: true }),
  ...audit_fields
})

// ========================
// Relations
// ========================

// ========================
// Relations emergency contacts
// ========================

export const relations_emergency_contacts = relations(emergency_contacts, ({ one }) => ({
  user: one(user, {
    fields: [emergency_contacts.user_id],
    references: [user.id]
  })
}))

export const relations_relationships = relations(relationships, ({ one }) => ({
  user: one(user, {
    fields: [relationships.user_id],
    references: [user.id],
    relationName: 'user_user_id'
  }),
  related_user: one(user, {
    fields: [relationships.related_user_id],
    references: [user.id],
    relationName: 'related_user_user_id'
  })
}))
