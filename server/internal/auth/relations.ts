import { relations } from 'drizzle-orm'
import { emergency_contacts, intervention_enrollment, interventions, notes, relationships, submissions, user } from '../schemas'

// ========================
// User Relations
// ========================
export const relations_user = relations(user, ({ many }) => ({
  intervention_enrollment: many(intervention_enrollment),
  created_interventions: many(interventions),
  emergency_contacts: many(emergency_contacts),
  beneficiary_notes: many(notes, { relationName: 'beneficiary_notes' }),
  created_notes: many(notes, { relationName: 'created_notes' }),
  relationship_user: many(relationships, { relationName: 'user_user_id' }),
  relationship_related_user: many(relationships, { relationName: 'related_user_user_id' }),
  submissions: many(submissions, { relationName: 'submission_user_id' })
  // evaluations: many(evaluations, { relationName: 'evaluator_id' })
  // instructed_meetings: many(meeting_schedule),
  // attendance_records: many(attendance),
  // marked_attendance: many(attendance, { relationName: 'marked_by_user' }),
  // attendance_reminders: many(attendance_reminders)
}))
