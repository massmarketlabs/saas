// server/database/schema/programs.ts
import { relations } from 'drizzle-orm'
import { boolean, date, integer, jsonb, pgTable, text, uuid } from 'drizzle-orm/pg-core'
import { user } from './auth'

import { program_status_enum } from './enums'
import { audit_fields } from './shared'

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

// ========================
// Terms
// ========================
export const terms = pgTable('terms', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
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
  description: text('description'),
  term_id: uuid('term_id').references(() => terms.id).notNull(), // TODO: update this to use intervention_
  program_id: uuid('program_id').references(() => programs.id).notNull(),
  start_date: date('start_date'),
  end_date: date('end_date'),
  created_by: text('created_by').references(() => user.id).notNull(),
  status: program_status_enum().notNull().default('active'),
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

// ========================
// Relations
// ========================

// ========================
// Programs Relations
// ========================
export const relations_programs = relations(programs, ({ many }) => ({
  // program_enrollment: many(program_enrollment),
  terms: many(terms),
  interventions: many(interventions)
}))

// ========================
// Terms Relations
// ========================
export const relations_terms = relations(terms, ({ many }) => ({
  interventions: many(interventions)
}))

// ========================
// Interventions Relations
// ========================
export const relations_interventions = relations(interventions, ({ one, many }) => ({
  term: one(terms, {
    fields: [interventions.term_id],
    references: [terms.id]
  }),
  program: one(programs, {
    fields: [interventions.program_id],
    references: [programs.id]
  }),
  created_by_user: one(user, {
    fields: [interventions.created_by],
    references: [user.id]
  }),
  intervention_enrollment: many(intervention_enrollment),
  evaluations: many(evaluation)
  // meeting_schedule: many(meeting_schedule),
  // attendance_settings: many(attendance_settings)
}))

// ========================
// Intervention Enrollment Relations
// ========================
export const relations_intervention_enrollment = relations(intervention_enrollment, ({ one }) => ({
  intervention: one(interventions, {
    fields: [intervention_enrollment.intervention_id],
    references: [interventions.id]
  }),
  user: one(user, {
    fields: [intervention_enrollment.user_id],
    references: [user.id]
  })
  // attendance: many(attendance)
}))

// ========================
// Evaluation Relations
// ========================
export const relations_evaluation = relations(evaluation, ({ one }) => ({
  intervention: one(interventions, {
    fields: [evaluation.intervention_id],
    references: [interventions.id]
  })
}))

// ========================
// User Relations
// ========================
export const relations_user = relations(user, ({ many }) => ({
  // program_enrollment: many(program_enrollment),
  intervention_enrollment: many(intervention_enrollment),
  created_interventions: many(interventions)
  // instructed_meetings: many(meeting_schedule),
  // attendance_records: many(attendance),
  // marked_attendance: many(attendance, { relationName: 'marked_by_user' }),
  // attendance_reminders: many(attendance_reminders)
}))
