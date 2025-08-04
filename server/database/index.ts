import type { NodePgDatabase } from 'drizzle-orm/node-postgres'
import type { z } from 'zod/v4'
import { createInsertSchema } from 'drizzle-zod'
import * as schema from '../database/schema'

// program.insert
export const insertProgramSchema = createInsertSchema(schema.programs)

export type RequestInsertProgram = z.infer<typeof insertProgramSchema>

// Database Queries
export const dbQueries = (db: NodePgDatabase<typeof schema>) => {
  return {
    program: {
      insert: async (payload: RequestInsertProgram) => {
        return await db.insert(schema.programs).values(payload).returning()
      },
      getById: async (id: string) => {
        return await db
          .query
          .programs
          .findFirst({
            where: (program, { eq }) => eq(program.id, id),
            with: {
              program_enrollment: {
                with: {
                  user: true
                }
              },
              terms: true,
              interventions: true
            }
          })
      }
    }
  }
}
