import type { InferSelectModel } from 'drizzle-orm'
import type { NodePgDatabase } from 'drizzle-orm/node-postgres'
import type { user as userSchema } from '../auth/schema'
import type { RequestCreateProgram } from './zod-types'
import { eq } from 'drizzle-orm'
import { DrizzleCrudRepository } from '../../utils/crud-repository'
import * as schema from './schema'

// Database Queries
export const programRepo = (db: NodePgDatabase<typeof schema>) => {
  const create = async (payload: RequestCreateProgram) => {
    const repo = new DrizzleCrudRepository(db, schema.programs)
    return await repo.create(payload)
  }

  const getById = async (id: string) => {
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
  }

  const patch = async (id: string, updates: Partial<RequestCreateProgram>) => {
    // Validate that there are actually updates to apply
    if (Object.keys(updates).length === 0) {
      throw new Error('No updates provided')
    }

    const result = await db
      .update(schema.programs)
      .set({
        ...updates
      })
      .where(eq(schema.programs.id, id))
      .returning()

    // Check if the record was found and updated
    if (result.length === 0) {
      throw new Error(`Program with id ${id} not found`)
    }

    return result[0] // return the single updated record
  }

  const enrollments = async (id: string) => {
    const resp = await db.query.programs.findFirst({
      where: (program, { eq }) => eq(program.id, id),
      with: {
        interventions: {
          with: {
            intervention_enrollment: {
              where: (enrollment, { isNull }) => isNull(enrollment.deleted_at),
              with: {
                user: true
              }
            }
          }
        }
      }
    })

    const rtn = new Map<string, InferSelectModel<typeof userSchema>>()

    resp?.interventions.forEach((intervention) => {
      intervention.intervention_enrollment.forEach((enrollment) => {
        rtn.set(enrollment.user_id, enrollment.user)
      })
    })

    return [...rtn.values()]
  }

  return {
    create,
    getById,
    patch,
    enrollments
  }
}
