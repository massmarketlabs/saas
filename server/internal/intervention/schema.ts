import { date, doublePrecision, integer, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { audit_fields } from '../../utils/auditFields'
import { user } from '../auth/schema'
import { programs } from '../program/schema'
import { storage } from '../storage/schema'

// ========================
// Program Status Enum
// ========================
export const program_status_enum = pgEnum('status', ['active', 'inactive'])

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
  status: program_status_enum().notNull().default('active'),
  credits: integer('credits'),
  room: text('room'),
  program_id: uuid('program_id').references(() => programs.id).notNull(),
  created_by: text('created_by').references(() => user.id).notNull(),
  term_id: uuid('term_id').references(() => terms.id).notNull(),
  primary_instructor_id: text('primary_instructor_id').references(() => user.id),
  syllabus_id: uuid('syllabus_id').references(() => storage.id),
  ...audit_fields
})

// ========================
// Announcements
// ========================
export const announcement = pgTable('announcements', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  body: text('body').notNull(),
  intervention_id: uuid('intervention_id').references(() => interventions.id).notNull(),
  created_by: text('created_by').references(() => user.id).notNull(),
  ...audit_fields
})

// ========================
// Intervention ↔ Enrollment
// ========================
export const enrollment = pgTable('enrollment', {
  id: uuid('id').primaryKey().defaultRandom(),
  letter_grade: text('letter_grade'),
  final_grade: doublePrecision('final_grade'),
  user_id: text('user_id').references(() => user.id).notNull(),
  intervention_id: uuid('intervention_id').references(() => interventions.id).notNull(),
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
  deadline: timestamp('deadline', { mode: 'string', withTimezone: true }).notNull(),
  intervention_id: uuid('intervention_id').references(() => interventions.id).notNull(),
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
  grade: integer('grade').notNull(),
  letter_grade: text('letter_grade').notNull(),
  comment: text('comment'),
  submission_id: uuid('submission_id').notNull().references(() => submissions.id),
  evaluator_id: text('evaluator_id').notNull().references(() => user.id),
  ...audit_fields
})

// ========================
// Attendance
// ========================
export const attendance = pgTable('attendance', {
  id: uuid('id').primaryKey().defaultRandom(),
  scheduled_date: timestamp('scheduled_date', { withTimezone: true, mode: 'string' }).notNull(),
  state: text('state').default('untracked').notNull(),
  note: text('note'),
  user_id: text('user_id').references(() => user.id).notNull(),
  intervention_id: uuid('intervention_id').notNull().references(() => interventions.id),
  ...audit_fields
})

// ========================
// Notes
// ========================
export const notes = pgTable('notes', {
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
// Subject
// ========================
export const subject = pgTable('subject', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description'),
  start_date: timestamp('start_date', { withTimezone: true, mode: 'string' }),
  end_date: timestamp('end_date', { withTimezone: true, mode: 'string' }),
  sort_order: integer('sort_order').notNull(),
  intervention_id: uuid('intervention_id').references(() => interventions.id).notNull(),
  ...audit_fields
})
