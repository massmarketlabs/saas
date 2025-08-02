import { date, integer, jsonb, pgEnum, pgTable, text, uuid } from 'drizzle-orm/pg-core'
import { user } from './auth'
import { audit_fields } from './shared'

// ========================
// Program Status Enum
// ========================
export const program_status_enum = pgEnum('status', ['active', 'inactive'])
// ========================
// Programs
// ========================
export const programs = pgTable('programs', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  ...audit_fields
})

// ========================
// Contact ↔ Program
// ========================
export const program_enrollment = pgTable('program_enrollment', {
  id: uuid('id').defaultRandom().primaryKey(),
  user_id: text('user_id').references(() => user.id).notNull(),
  program_id: uuid('program_id').references(() => programs.id).notNull(),
  status: program_status_enum().notNull().default('active'),
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
  created_by: text('created_by').references(() => user.id).notNull(),
  ...audit_fields
})

// ========================
// Intervention ↔ Enrollment
// ========================
export const intervention_enrollment = pgTable('intervention_enrollment', {
  id: uuid('id').primaryKey().defaultRandom(),
  intervention_id: uuid('intervention_id').references(() => interventions.id).notNull(),
  user_id: text('user_id').references(() => user.id).notNull(),
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
