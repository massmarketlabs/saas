import { and, eq } from 'drizzle-orm'
import z from 'zod/v4'
import { DrizzleCrudRepository } from '~~/server/database/crud-repository'
import * as schema from '~~/server/database/schema'

const payloadSchema = z.object({
  intervention_id: z.string(),
  user_id: z.string()
})

export default defineEventHandler(async (event) => {
  const __user = await requireAuth(event)
  const { intervention_id, user_id } = await readValidatedBody(event, payloadSchema.parse)
  // console.log(body)
  const db = await useDB(event)
  const repo = new DrizzleCrudRepository(db, schema.intervention_enrollment)

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
})
