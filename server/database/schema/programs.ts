import { date, pgTable, text, uuid } from 'drizzle-orm/pg-core'
import { beneficiary } from './beneficiary'
import { audit_fields } from './shared'

// ========================
// Programs
// ========================
export const programs = pgTable('programs', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  // Audit fields
  ...audit_fields
})

// ========================
// Contact ↔ Program
// ========================
export const program_enrollment = pgTable('program_enrollment', {
  id: uuid('id').defaultRandom().primaryKey(),
  contact_id: uuid('contact_id').references(() => beneficiary.id).notNull(),
  program_id: uuid('program_id').references(() => programs.id).notNull(),
  // Audit fields
  ...audit_fields
})

// ========================
// Terms
// ========================
export const terms = pgTable('terms', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(), // e.g. Fall 2025
  program_id: uuid('program_id').notNull().references(() => programs.id),
  start_date: date('start_date').notNull(),
  end_date: date('end_date').notNull(),
  // Audit fields
  ...audit_fields
})

// ========================
// Interventions
// ========================
export const intervention = pgTable('interventions', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  term_id: uuid('term_id').references(() => terms.id).notNull(),
  program_id: uuid('program_id').references(() => programs.id).notNull(),
  // Audit fields
  ...audit_fields
})

// ========================
// Intervention ↔ Enrollment
// ========================
export const intervention_enrollment = pgTable('intervention_enrollment', {
  id: uuid('id').primaryKey().defaultRandom(),
  intervention_id: uuid('intervention_id').references(() => intervention.id).notNull(),
  contact_id: uuid('contact_id').references(() => beneficiary.id).notNull(),
  ...audit_fields
})
