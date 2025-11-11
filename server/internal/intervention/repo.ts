import type { NodePgDatabase } from 'drizzle-orm/node-postgres'
import type { RequestCreateIntervention, RequestCreateInterventionEnrollment, RequestInsertSubject, RequestInsertTerm, RequestInsertUserNote } from './zod-types'
import { and, eq } from 'drizzle-orm'
import * as schema from '..'
import { DrizzleCrudRepository } from '../../utils/crud-repository'

export const interventionRepo = (db: NodePgDatabase<typeof schema>) => {
  const create = async (payload: RequestCreateIntervention) => {
    return await db.insert(schema.interventions).values(payload).returning()
  }

  const getById = async (interventionId: string) => {
    return await db
      .query
      .interventions
      .findFirst({
        where: (intervention, { eq }) => eq(intervention.id, interventionId),
        with: {
          program: true,
          term: true,
          syllabus: true,
          subjects: true,
          intervention_enrollment: {
            orderBy: (enrollment, { desc }) => desc(enrollment.updated_at),
            with: {
              user: true
            }
          }
        }
      })
  }

  const patch = async (payload: Partial<RequestCreateIntervention>) => {
    if (!payload.id) {
      return null
    }

    const repo = new DrizzleCrudRepository(db, schema.interventions)
    return await repo.updateById(payload.id, payload)
  }

  const getByUserId = async (userId: string) => {
    const interventions = await db.query.interventions.findMany({
      with: {
        program: true,
        term: true,
        intervention_enrollment: {
          where: (enrollment, { eq, isNull }) =>
            and(
              eq(enrollment.user_id, userId),
              isNull(enrollment.deleted_at)
            )
        }
      }
    })

    return interventions.map(intervention => ({
      ...intervention,
      isEnrolled: intervention.intervention_enrollment.length > 0
    }))
  }

  const toggleEnrollment = async (payload: RequestCreateInterventionEnrollment) => {
    const { intervention_id, user_id } = payload
    const enrollments = await db
      .select()
      .from(schema.enrollment)
      .where(
        and(
          eq(schema.enrollment.intervention_id, intervention_id),
          eq(schema.enrollment.user_id, user_id)
        )
      )
      .limit(1)

    const repo = new DrizzleCrudRepository(db, schema.enrollment)
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
  }

  const deleteEnrollment = async (payload: { id: string }) => {
    const repo = new DrizzleCrudRepository(db, schema.enrollment)
    const resp = await repo.deleteById(payload.id)
    return resp
  }

  const createTerm = async (payload: RequestInsertTerm) => {
    const repo = new DrizzleCrudRepository(db, schema.terms)
    const resp = await repo.create(payload)
    return resp
  }

  const createNote = async (payload: RequestInsertUserNote) => {
    const repo = new DrizzleCrudRepository(db, schema.notes)
    return await repo.create(payload)
  }

  const createSubject = async (payload: RequestInsertSubject) => {
    const repo = new DrizzleCrudRepository(db, schema.subject)
    return await repo.create(payload)
  }

  const updateSyllabusAttachmentId = async (payload: Pick<RequestCreateIntervention, 'syllabus_id' | 'id'>) => {
    const r = new DrizzleCrudRepository(db, schema.interventions)
    return await r.updateById(payload.id as string, payload)
  }

  const getInterventionClasslist = async (intervention_id: string) => {
    const resp = await db.query.enrollment.findMany({
      where: (enrollment, { eq }) => eq(enrollment.intervention_id, intervention_id),
      with: {
        user: true
      }
    })
    return resp
  }
  return {
    create,
    getById,
    patch,
    getByUserId,
    toggleEnrollment,
    deleteEnrollment,
    createTerm,
    createNote,
    updateSyllabusAttachmentId,
    createSubject,
    getInterventionClasslist
  }
}
