import { eq } from 'drizzle-orm'
import { H3Error } from 'h3'
import z from 'zod/v4'
import { beneficiary } from '~~/server/database/schema'

const DeleteBeneficiaryError = {
  Unauthorized: 'Unauthorized'
}

const deleteBeneficiarySchema = z.object({ id: z.uuid() })

export default defineEventHandler(async (event) => {
  try {
    const session = await getAuthSession(event)
    if (!session?.user?.id) {
      throw createError({
        statusCode: 401,
        statusMessage: DeleteBeneficiaryError.Unauthorized
      })
    }

    const body = await readBody(event)

    const payload = deleteBeneficiarySchema.parse(body)

    const db = await useDB()
    const resp = await db
      .delete(beneficiary)
      .where(eq(beneficiary.id, payload.id))
      .returning({ id: beneficiary.id })

    return resp
  } catch (error) {
    // Handle H3 errors (including our custom ones)
    if (error instanceof H3Error) {
      throw error
    }
    // Handle unexpected errors
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
