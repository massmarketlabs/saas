// server/database/schema/programs.ts
import { relations } from 'drizzle-orm'
import { boolean, date, doublePrecision, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { user } from './auth'
import { program_status_enum } from './enums'
import { audit_fields } from './shared'
import { emergency_contacts, relationships } from './user'

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
  term_id: uuid('term_id').references(() => terms.id).notNull(),
  program_id: uuid('program_id').references(() => programs.id).notNull(),
  start_date: date('start_date'),
  end_date: date('end_date'),
  created_by: text('created_by').references(() => user.id).notNull(),
  status: program_status_enum().notNull().default('active'),
  credits: integer('credits'),
  room: text('room'),
  primary_instructor_id: text('primary_instructor_id').references(() => user.id),
  ...audit_fields
})

// ========================
// Intervention ↔ Enrollment
// ========================
export const intervention_enrollment = pgTable('intervention_enrollment', {
  id: uuid('id').primaryKey().defaultRandom(),
  intervention_id: uuid('intervention_id').references(() => interventions.id).notNull(),
  user_id: text('user_id').references(() => user.id).notNull(),
  letter_grade: text('letter_grade'),
  final_grade: doublePrecision('final_grade'),
  ...audit_fields
})

// ========================
// User Notes
// ========================
export const user_notes = pgTable('user_notes', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  priority: text('priority').notNull(),
  created_by: text('created_by').references(() => user.id).notNull(),
  beneficiary_id: text('beneficiary_id').references(() => user.id).notNull(),
  intervention_id: uuid('intervention_id').references(() => interventions.id),
  ...audit_fields
})

// ========================
// Assignments
// ========================
export const assignments = pgTable('assignments', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description'),
  type: text('type').notNull(),
  max_grade: integer('max_grade').notNull(),
  intervention_id: uuid('intervention_id').references(() => interventions.id).notNull(),
  deadline: timestamp('deadline', { mode: 'string', withTimezone: true }).notNull(),
  ...audit_fields
})

// ========================
// Submission
// ========================
export const submissions = pgTable('submissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: text('user_id').notNull().references(() => user.id),
  assignment_id: uuid('assignment_id').notNull().references(() => assignments.id),
  ...audit_fields
})

// ========================
// Evaluation
// ========================
export const evaluations = pgTable('evaluations', {
  id: uuid('id').primaryKey().defaultRandom(),
  evaluator_id: text('evaluator_id').notNull().references(() => user.id),
  submission_id: uuid('submission_id').notNull().references(() => submissions.id),
  grade: integer('grade').notNull(),
  letter_grade: text('letter_grade').notNull(),
  comment: text('comment'),
  ...audit_fields
})

// ========================
// Attendance
// ========================
export const attendance = pgTable('attendance', {
  id: uuid('id').primaryKey().defaultRandom(),
  intervention_id: uuid('intervention_id').notNull().references(() => interventions.id),
  user_id: text('user_id').references(() => user.id).notNull(),
  scheduled_date: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
  state: text('state').default('untracked').notNull(),
  note: text('note'),
  ...audit_fields
})

// ========================
// Relations
// ========================

// ========================
// Evaluations Relations
// ========================
export const relations_evaluation = relations(evaluations, ({ one }) => ({
  evaluator: one(user, {
    fields: [evaluations.evaluator_id],
    references: [user.id],
    relationName: 'evaluator_id'
  }),
  submission: one(submissions, {
    fields: [evaluations.submission_id],
    references: [submissions.id]
  })
}))

// ========================
// Assignments Relations
// ========================
export const relations_assignments = relations(assignments, ({ one }) => ({
  intervention: one(interventions, {
    fields: [assignments.intervention_id],
    references: [interventions.id]
  })
}))

export const relations_submssions = relations(submissions, ({ one, many }) => ({
  assignment: one(assignments, {
    fields: [submissions.assignment_id],
    references: [assignments.id]
  }),
  user: one(user, {
    fields: [submissions.user_id],
    references: [user.id],
    relationName: 'submission_user_id'
  }),
  evaluations: many(evaluations)
  // evaluation: one(evaluations, {
  //   fields: [submissions.id],
  //   references: [evaluations.submission_id]
  // })
}))
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
  intervention_enrollment: many(intervention_enrollment)
  // meeting_schedule: many(meeting_schedule),
  // attendance_settings: many(attendance_settings)
}))

// ========================
// User Relations
// ========================
export const relations_user = relations(user, ({ many }) => ({
  intervention_enrollment: many(intervention_enrollment),
  created_interventions: many(interventions),
  emergency_contacts: many(emergency_contacts),
  beneficiary_notes: many(user_notes, { relationName: 'beneficiary_notes' }),
  created_notes: many(user_notes, { relationName: 'created_notes' }),
  relationship_user: many(relationships, { relationName: 'user_user_id' }),
  relationship_related_user: many(relationships, { relationName: 'related_user_user_id' }),
  submissions: many(submissions, { relationName: 'submission_user_id' })
  // evaluations: many(evaluations, { relationName: 'evaluator_id' })

  // instructed_meetings: many(meeting_schedule),
  // attendance_records: many(attendance),
  // marked_attendance: many(attendance, { relationName: 'marked_by_user' }),
  // attendance_reminders: many(attendance_reminders)
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
// User Notes Relations
// ========================
export const relations_user_notes = relations(user_notes, ({ one }) => ({
  intervention: one(interventions, {
    fields: [user_notes.intervention_id],
    references: [interventions.id],
    relationName: 'created_notes'
  }),
  created_by: one(user, {
    fields: [user_notes.created_by],
    references: [user.id]
  }),
  beneficiary: one(user, {
    fields: [user_notes.beneficiary_id],
    references: [user.id],
    relationName: 'beneficiary_notes'
  })
}))
