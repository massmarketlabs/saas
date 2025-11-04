import { relations } from 'drizzle-orm'
import { user } from '../auth/schema'
import { emergency_contacts, relationships } from './schema'

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
