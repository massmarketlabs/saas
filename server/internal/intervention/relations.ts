import { relations } from 'drizzle-orm'
import { user } from '../auth'
import { programs } from '../program/schema'
import { storage } from '../storage/schema'
import { announcement, assignments, enrollment, evaluation, interventions, notes, subject, submission, terms } from './schema'

// ========================
// Announcement Relations
// ========================
export const relations_announcement = relations(announcement, ({ one }) => ({
  intervention: one(interventions, {
    references: [interventions.id],
    fields: [announcement.intervention_id]
  }),
  creator: one(user, {
    references: [user.id],
    fields: [announcement.created_by]
  })
}))

// ========================
// Evaluations Relations
// ========================
export const relations_evaluation = relations(evaluation, ({ one }) => ({
  evaluator: one(user, {
    fields: [evaluation.evaluator_id],
    references: [user.id],
    relationName: 'evaluator_id'
  }),
  submission: one(submission, {
    fields: [evaluation.submission_id],
    references: [submission.id]
  })
}))

// ========================
// Assignments Relations
// ========================
export const relations_assignments = relations(assignments, ({ one }) => ({
  intervention: one(subject, {
    fields: [assignments.subject_id],
    references: [subject.id]
  })
}))

export const relations_submssions = relations(submission, ({ one, many }) => ({
  assignment: one(assignments, {
    fields: [submission.assignment_id],
    references: [assignments.id]
  }),
  user: one(user, {
    fields: [submission.user_id],
    references: [user.id],
    relationName: 'submission_user_id'
  }),
  evaluations: many(evaluation)
  // evaluation: one(evaluations, {
  //   fields: [submissions.id],
  //   references: [evaluations.submission_id]
  // })
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
  intervention_enrollment: many(enrollment),
  announcements: many(announcement),
  primary_instructor: one(user, {
    fields: [interventions.primary_instructor_id],
    references: [user.id]
  }),
  syllabus: one(storage, {
    fields: [interventions.syllabus_id],
    references: [storage.id]
  }),
  subjects: many(subject)
  // meeting_schedule: many(meeting_schedule),
  // attendance_settings: many(attendance_settings)
}))

// ========================
// Intervention Enrollment Relations
// ========================
export const relations_intervention_enrollment = relations(enrollment, ({ one }) => ({
  intervention: one(interventions, {
    fields: [enrollment.intervention_id],
    references: [interventions.id]
  }),
  user: one(user, {
    fields: [enrollment.user_id],
    references: [user.id]
  })
  // attendance: many(attendance)
}))

// ========================
// User Notes Relations
// ========================
export const relations_user_notes = relations(notes, ({ one }) => ({
  intervention: one(interventions, {
    fields: [notes.intervention_id],
    references: [interventions.id],
    relationName: 'created_notes'
  }),
  created_by: one(user, {
    fields: [notes.created_by],
    references: [user.id]
  }),
  beneficiary: one(user, {
    fields: [notes.beneficiary_id],
    references: [user.id],
    relationName: 'beneficiary_notes'
  })
}))

export const relations_subject = relations(subject, ({ one }) => ({
  intervention: one(interventions, {
    fields: [subject.intervention_id],
    references: [interventions.id]
  })
}))
