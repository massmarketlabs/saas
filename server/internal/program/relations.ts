import { relations } from 'drizzle-orm'
import { interventions } from '../schemas'
import { programs } from './schema'

// ========================
// Relations
// ========================

// ========================
// Programs Relations
// ========================
export const relations_programs = relations(programs, ({ many }) => ({
  interventions: many(interventions)
}))
