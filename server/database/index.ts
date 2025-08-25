import type { User } from 'better-auth'
import type { InferSelectModel } from 'drizzle-orm'
import type { NodePgDatabase } from 'drizzle-orm/node-postgres'
import type { EventAuditParams } from '../utils/auditLogger'
import type { paginatedSchema } from './utils'
import { and, eq } from 'drizzle-orm'
import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod/v4'
import * as schema from '../database/schema'
import { DrizzleCrudRepository } from './crud-repository'

// program.insert
export const insertProgramSchema = createInsertSchema(schema.programs)
export type RequestCreateProgram = z.infer<typeof insertProgramSchema>

// interventions.insert
export const requestCreateInterventionSchema = createInsertSchema(schema.interventions)
export type RequestCreateIntervention = z.infer<typeof requestCreateInterventionSchema>

export const insertInterventionEnrollment = createInsertSchema(schema.intervention_enrollment, { intervention_id: z.string(), user_id: z.string() }) // TODO: ensure that no leaking uuid that don't use v4
type RequestCreateInterventionEnrollment = z.infer<typeof insertInterventionEnrollment>

export const byIdSchema = z.object({ id: z.uuid() })
type RequestById = z.infer<typeof byIdSchema>

// terms.insert
export const insertTerm = createInsertSchema(schema.terms).refine(data => data.end_date > data.start_date, {
  message: 'End date cannot be earlier than start date.',
  path: ['end_date']
})
export type RequestInsertTerm = z.infer<typeof insertTerm>

// user.user_notes.insert
export const insertUserNote = createInsertSchema(schema.user_notes)
export type RequestInsertUserNote = z.infer<typeof insertUserNote>

// user.emergency_contact
export const insertUserEmergencyContact = createInsertSchema(schema.emergency_contacts)
export type RequestInsertUserEmergencyContact = z.infer<typeof insertUserEmergencyContact>

// user.relationship
export const insertUserRelationship = createInsertSchema(schema.relationships)
export type RequestInsertRelationship = z.infer<typeof insertUserRelationship>

// Database Queries
export const dbQueries = (db: NodePgDatabase<typeof schema>) => {
  return {
    program: {
      insert: async (payload: RequestCreateProgram) => {
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
      patch: async (id: string, updates: Partial<RequestCreateProgram>) => {
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
      },
      enrollments: async (id: string) => {
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

        const rtn = new Map<string, InferSelectModel<typeof schema.user>>()

        resp?.interventions.forEach((intervention) => {
          intervention.intervention_enrollment.forEach((enrollment) => {
            rtn.set(enrollment.user_id, enrollment.user)
          })
        })

        return [...rtn.values()]
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
                orderBy: (enrollment, { desc }) => desc(enrollment.updated_at),
                with: {
                  user: true
                }
              }
            }
          })
      },
      patch: async (payload: Partial<RequestCreateIntervention>) => {
        if (!payload.id) {
          return null
        }

        const repo = new DrizzleCrudRepository(db, schema.interventions)
        return await repo.updateById(payload.id, payload)
      },
      toggleEnrollment: async (payload: RequestCreateInterventionEnrollment) => {
        const { intervention_id, user_id } = payload
        const enrollments = await db
          .select()
          .from(schema.intervention_enrollment)
          .where(
            and(
              eq(schema.intervention_enrollment.intervention_id, intervention_id),
              eq(schema.intervention_enrollment.user_id, user_id)
            )
          )
          .limit(1)

        const repo = new DrizzleCrudRepository(db, schema.intervention_enrollment)
        const enrollment = enrollments[0]
        if (!enrollment) {
          await repo.create({
            intervention_id,
            user_id
          })

          return {
            success: true,
            message: 'Created new enrollment'
          }
        }

        const isDeleted = enrollment.deleted_at

        if (isDeleted) {
          await repo.updateById(enrollment.id, { ...enrollment, deleted_at: null })
          return {
            success: true,
            message: 'Enrollment in intervention reactivated'
          }
        }

        await repo.updateById(enrollment.id, { ...enrollment, deleted_at: new Date().toUTCString() })
        return {
          success: true,
          message: 'Enrollment in intervention marked as deleted'
        }
      },
      deleteEnrollment: async (payload: RequestById, user: User, auditParams: EventAuditParams) => {
        const repo = new DrizzleCrudRepository(db, schema.intervention_enrollment)
        const resp = await repo.deleteById(payload.id)
        await logAuditEvent({
          userId: user.id,
          ipAddress: auditParams.ipAddress,
          userAgent: auditParams.userAgent,
          targetId: payload.id,
          category: 'enrollment',
          action: `DELETE: Intervention Enrollment`,
          targetType: 'intervention_enrollment',
          status: 'success'
        })
        return resp
      }
    },
    terms: {
      insert: async (payload: RequestInsertTerm) => {
        const repo = new DrizzleCrudRepository(db, schema.terms)
        const resp = await repo.create(payload)
        return resp
      }
    },
    user: {
      getById: async (id: string) => {
        const resp = await db.query.user.findFirst({
          where: (user, { eq }) => eq(user.id, id),
          with: {
            relationship_user: {
              with: {
                related_user: true
              }
            },
            emergency_contacts: true,
            beneficiary_notes: {
              with: {
                created_by: true,
                intervention: true
              }
            },
            intervention_enrollment: {
              with: {
                intervention: true
              }
            }
          }
        })
        return resp
      },
      list: async (query: z.infer<typeof paginatedSchema>) => {
        const repo = new DrizzleCrudRepository(db, schema.user)
        const resp = await repo.list(query)
        return resp
      },
      insertNote: async (note: RequestInsertUserNote) => {
        const repo = new DrizzleCrudRepository(db, schema.user_notes)
        return await repo.create(note)
      },
      insertEmergencyContact: async (contact: RequestInsertUserEmergencyContact) => {
        const repo = new DrizzleCrudRepository(db, schema.emergency_contacts)
        return await repo.create(contact)
      },
      insertRelationship: async (relationship: RequestInsertRelationship) => {
        console.log({ relationship })
      }
    }
  }
}
