import { date, doublePrecision, integer, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { audit_fields } from '../../utils/auditFields'
import { programs, storage, user } from '../schemas'

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
  term_id: uuid('term_id').references(() => terms.id).notNull(),
  program_id: uuid('program_id').references(() => programs.id).notNull(),
  created_by: text('created_by').references(() => user.id).notNull(),
  status: program_status_enum().notNull().default('active'),
  credits: integer('credits'),
  room: text('room'),
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
  intervention_id: uuid('intervention_id').references(() => interventions.id).notNull(),
  user_id: text('user_id').references(() => user.id).notNull(),
  letter_grade: text('letter_grade'),
  final_grade: doublePrecision('final_grade'),
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
