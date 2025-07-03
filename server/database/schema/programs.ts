import { date, integer, jsonb, pgTable, text, uuid, varchar } from 'drizzle-orm/pg-core'
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
  beneficiary_id: uuid('beneficiary_id').references(() => beneficiary.id).notNull(),
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
export const interventions = pgTable('interventions', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  term_id: uuid('term_id').references(() => terms.id).notNull(),
  program_id: uuid('program_id').references(() => programs.id).notNull(),
  // Audit fields
  ...audit_fields
})

// ========================
// Intervention Enrollment Type
// ========================
// export const intervention_enrollment_type = pgTable('intervention_enrollment_type', {
//   id: uuid('id').primaryKey().defaultRandom(),
//   code: varchar('code', { length: 3 }).notNull().unique(),
//   name: text('name').notNull().unique(),
//   ...audit_fields
// })

// ========================
// Intervention ↔ Enrollment
// ========================
export const beneficiary_intervention_enrollment = pgTable('beneficiary_intervention_enrollment', {
  id: uuid('id').primaryKey().defaultRandom(),
  intervention_id: uuid('intervention_id').references(() => interventions.id).notNull(),
  beneficiary_id: uuid('beneficiary_id').references(() => beneficiary.id).notNull(),
  // enrollment_type_id: uuid('enrollment_type_id').references(() => intervention_enrollment_type.id).notNull(),
  ...audit_fields
})

// ========================
// Evaluation
// ========================
export const evaluation = pgTable('evaluation', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').unique(),
  version: integer('version'),
  intervention_id: uuid('intervention_id').references(() => interventions.id).notNull(),
  form: jsonb('form'),
  ...audit_fields
})
