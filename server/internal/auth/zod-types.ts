import type { z } from 'zod/v4'
import { createInsertSchema } from 'drizzle-zod'
import * as schema from '../schemas'

// user.emergency_contact

export const insertUserEmergencyContact = createInsertSchema(schema.emergency_contacts)
export type RequestInsertUserEmergencyContact = z.infer<typeof insertUserEmergencyContact>

export const insertUserRelationship = createInsertSchema(schema.relationships).array()
export type RequestInsertRelationship = z.infer<typeof insertUserRelationship>
