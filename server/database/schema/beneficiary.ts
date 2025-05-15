import { boolean, date, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core'
import { user } from './auth'
import { audit_fields } from './shared'
// import type { SQL } from 'drizzle-orm'
// import { sql } from 'drizzle-orm'

// ========================
// Beneficiary
// ========================
export const beneficiary = pgTable('beneficiary', {
  // Internal primary key
  id: uuid('id').primaryKey().defaultRandom(),

  // Authentication fields
  // auth_provider_id: text('auth_provider_id').unique(), // ID from authentication provider
  // auth_provider: text('auth_provider'), // Which provider (google, github, etc.)
  email: text('email').unique(),

  // Name fields
  first_name_en: text('first_name_en').notNull(),
  middle_name_en: text('middle_name_en'),
  last_name_en: text('last_name_en').notNull(),
  first_name_ar: text('first_name_ar').default(''),
  middle_name_ar: text('middle_name_ar'),
  last_name_ar: text('last_name_ar').default(''),
  display_name: text('display_name'),

  // Profile fields
  dob: date('dob'),
  gender: text('gender'),
  profile_image_url: text('profile_image_url'),

  // Contact information
  phone: text('phone'),
  address: text('address'),

  // Organization fields
  gid: text('gid').unique(), // Global identifier
  role: text('role'),
  joined_at: date('joined_at'),
  // TODO: Search needs to be not null, generatedAlwaysAs might suffice
  // search: tsvector('search')
  //   .generatedAlwaysAs(
  //     (): SQL =>
  //       sql`setweight(to_tsvector('english', coalesce(${contact.first_name_en}, '')), 'A')
  //       ||
  //       setweight(to_tsvector('english', coalesce(${contact.last_name_en}, '')), 'A')
  //       ||
  //       setweight(to_tsvector('english', coalesce(${contact.display_name}, '')), 'A')
  //       ||
  //       setweight(to_tsvector('english', coalesce(${contact.gid}, '')), 'A')
  //       ||
  //       setweight(to_tsvector('english', coalesce(${contact.role}, '')), 'A')
  //       ||
  //       setweight(to_tsvector('english', coalesce(${contact.gender}, '')), 'A')`,
  //   ),
  // Add a GIN index on the combined text fields using trigram
  // search_trigram: text('search_trigram')
  //   .generatedAlwaysAs(
  //     (): SQL => sql`${contact.first_name_en} || ' ' || ${contact.last_name_en} || ' ' || ${contact.display_name} || ' ' || ${contact.gid} || ' ' || ${contact.gender}`,
  //   ),
  // .generatedAlwaysAs((): SQL => sql`to_tsvector('english', ${contact.search})`),

  // Audit fields
  ...audit_fields
}
// , t => [
  // index('idx_body_search').using('gin', t.search),
  // index('idx_trigram_search').using('gin', sql`${t.search_trigram} gin_trgm_ops`),
// ]
)

// ========================
// Emergency Contacts
// ========================
export const emergency_contacts = pgTable('emergency_contacts', {
  id: uuid('id').primaryKey().defaultRandom(),
  beneficiary_id: uuid('beneficiary_id').references(() => beneficiary.id).notNull(),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  relationship: text('relationship').notNull(),
  is_primary: boolean('is_primary').default(false), // Optional: to mark primary contact

  // Audit fields
  ...audit_fields
})

// ========================
// beneficiary Relationships
// ========================
export const beneficiary_relationships = pgTable('beneficiary_relationships', {
  id: uuid('id').primaryKey().defaultRandom(),
  beneficiary_id: uuid('beneficiary_id').references(() => beneficiary.id).notNull(),
  related_beneficiary_id: uuid('related_beneficiary_id').references(() => beneficiary.id).notNull(),
  relationship_type: text('relationship_type').notNull(), // parent, child, spouse, etc.

  // Audit fields
  ...audit_fields
}, (table) => {
  return {
    unq_relationship: uniqueIndex('unq_relationship').on(
      table.beneficiary_id,
      table.related_beneficiary_id,
      table.relationship_type
    )
  }
})

// ========================
// Approval Requests
// ========================
export const approval_request = pgTable('approval_request', {
  id: uuid('id').primaryKey().defaultRandom(),
  beneficiary_id: uuid('beneficiary_id').references(() => beneficiary.id).notNull(),
  submitted_by: uuid('submitted_by').references(() => user.id).notNull(),
  reason: text('reason').notNull(),
  reviewed_by: uuid('reviewed_by'),
  approved: timestamp('approved', { mode: 'string', withTimezone: true }),

  // Audit fields
  ...audit_fields
})
