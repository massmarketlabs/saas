import type { AnyPgTable } from 'drizzle-orm/pg-core'
import { DrizzleCrudRepository } from '~~/server/database/crud-repository'
import * as schema from '~~/server/database/schema'
import { paginatedSchema } from '~~/server/database/utils'
import { isValidTable } from '~~/server/utils/db'

export default eventHandler(async (event) => {
  const tableName = getRouterParam(event, 'tableName')
  if (!tableName) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      data: 'EMPTY_TABLE_NAME',
      message: 'Empty Table Name'
    })
  }

  if (!isValidTable(tableName)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      data: 'INVALID_TABLE_NAME',
      message: 'Invalid Table Name'
    })
  }

  const query = await getValidatedQuery(event, paginatedSchema.parse)
  const table = schema[tableName] as AnyPgTable
  const db = await useDB(event)
  const repo = new DrizzleCrudRepository(db, table)
  const resp = await repo.list(query)
  return resp
})
