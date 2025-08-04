import { relations } from 'drizzle-orm'
import { boolean, integer, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { user } from './auth'
import { intervention_enrollment, interventions } from './programs' // assuming your existing schema
import { audit_fields } from './shared'

// ========================
// Attendance Status Enum
// ========================
export const attendance_status_enum = pgEnum('attendance_status', [
  'present',
  'absent',
  'late',
  'excused'
])

// ========================
// Absence Reasons
// ========================
export const absence_reasons = pgTable('absence_reasons', {
  id: uuid('id').primaryKey().defaultRandom(),
  reason: text('reason').notNull().unique(), // e.g., 'Illness', 'Family Emergency', 'Work Conflict'
  description: text('description'),
  is_excused: boolean('is_excused').default(false).notNull(), // whether this reason auto-excuses the absence
  is_active: boolean('is_active').default(true).notNull(),
  sort_order: integer('sort_order').default(0),
  ...audit_fields
})

// ========================
// Reminder Status Enum
// ========================
export const reminder_status_enum = pgEnum('reminder_status', [
  'pending',
  'sent',
  'acknowledged',
  'dismissed'
])

// ========================
// Meeting Schedule
// ========================
export const meeting_schedule = pgTable('meeting_schedule', {
  id: uuid('id').primaryKey().defaultRandom(),
  intervention_id: uuid('intervention_id').references(() => interventions.id).notNull(),
  meeting_date: timestamp('meeting_date').notNull(),
  meeting_title: text('meeting_title'),
  meeting_description: text('meeting_description'),
  instructor_id: text('instructor_id').references(() => user.id).notNull(),
  is_cancelled: boolean('is_cancelled').default(false).notNull(),
  location: text('location'),
  duration_minutes: integer('duration_minutes').default(60),
  ...audit_fields
})

// ========================
// Attendance Records
// ========================
export const attendance = pgTable('attendance', {
  id: uuid('id').primaryKey().defaultRandom(),
  meeting_id: uuid('meeting_id').references(() => meeting_schedule.id).notNull(),
  user_id: text('user_id').references(() => user.id).notNull(),
  intervention_enrollment_id: uuid('intervention_enrollment_id').references(() => intervention_enrollment.id).notNull(),
  status: attendance_status_enum().notNull().default('present'),
  absence_reason_id: uuid('absence_reason_id').references(() => absence_reasons.id), // only for absent/excused status
  check_in_time: timestamp('check_in_time'),
  notes: text('notes'),
  marked_by: text('marked_by').references(() => user.id).notNull(), // instructor who marked attendance
  ...audit_fields
})

// ========================
// Attendance Reminders
// ========================
export const attendance_reminders = pgTable('attendance_reminders', {
  id: uuid('id').primaryKey().defaultRandom(),
  meeting_id: uuid('meeting_id').references(() => meeting_schedule.id).notNull(),
  instructor_id: text('instructor_id').references(() => user.id).notNull(),
  reminder_type: text('reminder_type').notNull(), // 'pre_meeting', 'post_meeting', 'overdue'
  scheduled_time: timestamp('scheduled_time').notNull(),
  sent_time: timestamp('sent_time'),
  status: reminder_status_enum().notNull().default('pending'),
  message: text('message'),
  acknowledgment_time: timestamp('acknowledgment_time'),
  ...audit_fields
})

// ========================
// Attendance Settings
// ========================
export const attendance_settings = pgTable('attendance_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  intervention_id: uuid('intervention_id').references(() => interventions.id).notNull(),
  pre_meeting_reminder_minutes: integer('pre_meeting_reminder_minutes').default(30), // remind 30 min before
  post_meeting_reminder_minutes: integer('post_meeting_reminder_minutes').default(60), // remind 1 hour after if not taken
  overdue_reminder_hours: integer('overdue_reminder_hours').default(24), // remind daily if still not taken
  auto_mark_absent_hours: integer('auto_mark_absent_hours').default(48), // auto-mark absent after 48 hours
  require_check_in_time: boolean('require_check_in_time').default(false),
  allow_late_attendance: boolean('allow_late_attendance').default(true),
  late_threshold_minutes: integer('late_threshold_minutes').default(15),
  ...audit_fields
})

// ========================
// Relations
// ========================

// ========================
// Absence Reasons Relations
// ========================
export const relations_absence_reasons = relations(absence_reasons, ({ many }) => ({
  attendance_records: many(attendance)
}))

// ========================
// Meeting Schedule Relations
// ========================
export const relations_meeting_schedule = relations(meeting_schedule, ({ one, many }) => ({
  intervention: one(interventions, {
    fields: [meeting_schedule.intervention_id],
    references: [interventions.id]
  }),
  instructor: one(user, {
    fields: [meeting_schedule.instructor_id],
    references: [user.id]
  }),
  attendance_records: many(attendance),
  reminders: many(attendance_reminders)
}))

// ========================
// Attendance Relations
// ========================
export const relations_attendance = relations(attendance, ({ one }) => ({
  meeting: one(meeting_schedule, {
    fields: [attendance.meeting_id],
    references: [meeting_schedule.id]
  }),
  user: one(user, {
    fields: [attendance.user_id],
    references: [user.id]
  }),
  intervention_enrollment: one(intervention_enrollment, {
    fields: [attendance.intervention_enrollment_id],
    references: [intervention_enrollment.id]
  }),
  marked_by_user: one(user, {
    fields: [attendance.marked_by],
    references: [user.id]
  }),
  absence_reason: one(absence_reasons, {
    fields: [attendance.absence_reason_id],
    references: [absence_reasons.id]
  })
}))

// ========================
// Attendance Reminders Relations
// ========================
export const relations_attendance_reminders = relations(attendance_reminders, ({ one }) => ({
  meeting: one(meeting_schedule, {
    fields: [attendance_reminders.meeting_id],
    references: [meeting_schedule.id]
  }),
  instructor: one(user, {
    fields: [attendance_reminders.instructor_id],
    references: [user.id]
  })
}))

// ========================
// Attendance Settings Relations
// ========================
export const relations_attendance_settings = relations(attendance_settings, ({ one }) => ({
  intervention: one(interventions, {
    fields: [attendance_settings.intervention_id],
    references: [interventions.id]
  })
}))
