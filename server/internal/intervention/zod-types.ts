import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod/v4'
import * as schema from './schema'

// interventions.insert
export const requestCreateInterventionSchema = createInsertSchema(schema.interventions)
export type RequestCreateIntervention = z.infer<typeof requestCreateInterventionSchema>

// intervention enrollment insert
export const insertInterventionEnrollment = createInsertSchema(schema.enrollment, { intervention_id: z.string(), user_id: z.string() }) // TODO: ensure that no leaking uuid that don't use v4
export type RequestCreateInterventionEnrollment = z.infer<typeof insertInterventionEnrollment>

// terms.insert

export const insertTerm = createInsertSchema(schema.terms).refine(data => data.end_date > data.start_date, {
  message: 'End date cannot be earlier than start date.',
  path: ['end_date']
})
export type RequestInsertTerm = z.infer<typeof insertTerm>

// user.user_notes.insert
export const insertUserNote = createInsertSchema(schema.notes)
export type RequestInsertUserNote = z.infer<typeof insertUserNote>

export const insertAnnouncement = createInsertSchema(schema.announcement)
export type RequestInsertAnnouncement = z.infer<typeof insertAnnouncement>

export const insertSubject = createInsertSchema(schema.subject, { title: z.string().min(1) })
export type RequestInsertSubject = z.infer<typeof insertSubject>
