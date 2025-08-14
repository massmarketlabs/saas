import type { NodePgDatabase } from 'drizzle-orm/node-postgres'
import type { z } from 'zod/v4'
import type { paginatedSchema } from './utils'
import { eq } from 'drizzle-orm'
import { createInsertSchema } from 'drizzle-zod'
import * as schema from '../database/schema'
import { DrizzleCrudRepository } from './crud-repository'

// program.insert
export const insertProgramSchema = createInsertSchema(schema.programs)

type RequestInsertProgram = z.infer<typeof insertProgramSchema>

// interventions.insert
type RequestCreateIntervention = typeof schema.interventions.$inferInsert

export const requestCreateInterventionSchema = createInsertSchema(schema.interventions).omit({ created_by: true })

// Database Queries
export const dbQueries = (db: NodePgDatabase<typeof schema>) => {
  return {
    program: {
      insert: async (payload: RequestInsertProgram) => {
        const repo = new DrizzleCrudRepository(db, schema.programs)
        return await repo.create(payload)
      },
      getById: async (id: string) => {
        return await db
          .query
          .programs
          .findFirst({
            where: (program, { eq }) => eq(program.id, id),
            with: {
              interventions: {
                with: {
                  term: true,
                  intervention_enrollment: {
                    with: {
                      user: true
                    }
                  }
                }
              }
            }
          })
      },
      patch: async (id: string, updates: Partial<RequestInsertProgram>) => {
        // Validate that there are actually updates to apply
        if (Object.keys(updates).length === 0) {
          throw new Error('No updates provided')
        }

        const result = await db
          .update(schema.programs)
          .set({
            ...updates,
            updated_at: new Date().toISOString()
            // updated_at: new Date() // assuming you have an updated_at timestamp field
          })
          .where(eq(schema.programs.id, id))
          .returning()

        // Check if the record was found and updated
        if (result.length === 0) {
          throw new Error(`Program with id ${id} not found`)
        }

        return result[0] // return the single updated record
      }
    },
    interventions: {
      insert: async (payload: RequestCreateIntervention) => {
        return await db.insert(schema.interventions).values(payload).returning()
      },
      getById: async (interventionId: string) => {
        return await db
          .query
          .interventions
          .findFirst({
            where: (intervention, { eq }) => eq(intervention.id, interventionId),
            with: {
              program: true,
              term: true,
              evaluations: true,
              intervention_enrollment: {
                with: {
                  user: true
                }
              }
            }
          })
      }
    },
    user: {
      list: async (query: z.infer<typeof paginatedSchema>) => {
        const repo = new DrizzleCrudRepository(db, schema.user)
        const resp = await repo.list(query)
        return resp
      }
    }
  }
}
