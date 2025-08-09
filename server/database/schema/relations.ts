import { relations } from 'drizzle-orm'
import * as schema from '../schema'

// ========================
// Relations
// ========================

// ========================
// Programs Relations
// ========================
export const relations_programs = relations(schema.programs, ({ many }) => ({
  // program_enrollment: many(program_enrollment),
  terms: many(schema.terms),
  interventions: many(schema.interventions)
}))

// ========================
// Terms Relations
// ========================
export const relations_terms = relations(schema.terms, ({ many }) => ({
  interventions: many(schema.interventions)
}))

// ========================
// Interventions Relations
// ========================
export const relations_interventions = relations(schema.interventions, ({ one, many }) => ({
  term: one(schema.terms, {
    fields: [schema.interventions.term_id],
    references: [schema.terms.id]
  }),
  program: one(schema.programs, {
    fields: [schema.interventions.program_id],
    references: [schema.programs.id]
  }),
  created_by_user: one(schema.user, {
    fields: [schema.interventions.created_by],
    references: [schema.user.id]
  }),
  intervention_enrollment: many(schema.intervention_enrollment),
  evaluations: many(schema.evaluation)
  // meeting_schedule: many(meeting_schedule),
  // attendance_settings: many(attendance_settings)
}))

// ========================
// Intervention Enrollment Relations
// ========================
export const relations_intervention_enrollment = relations(schema.intervention_enrollment, ({ one }) => ({
  intervention: one(schema.interventions, {
    fields: [schema.intervention_enrollment.intervention_id],
    references: [schema.interventions.id]
  }),
  user: one(schema.user, {
    fields: [schema.intervention_enrollment.user_id],
    references: [schema.user.id]
  })
  // attendance: many(attendance)
}))

// ========================
// Evaluation Relations
// ========================
export const relations_evaluation = relations(schema.evaluation, ({ one }) => ({
  intervention: one(schema.interventions, {
    fields: [schema.evaluation.intervention_id],
    references: [schema.interventions.id]
  })
}))

// ========================
// User Relations
// ========================
export const relations_user = relations(schema.user, ({ many }) => ({
  // program_enrollment: many(program_enrollment),
  intervention_enrollment: many(schema.intervention_enrollment),
  created_interventions: many(schema.interventions)
  // instructed_meetings: many(meeting_schedule),
  // attendance_records: many(attendance),
  // marked_attendance: many(attendance, { relationName: 'marked_by_user' }),
  // attendance_reminders: many(attendance_reminders)
}))
