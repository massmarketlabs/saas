import type { AnyPgTable } from 'drizzle-orm/pg-core'
import * as schema from '~~/server/internal/schemas'
import { DrizzleCrudRepository } from '~~/server/utils/crud-repository'
import { isValidTable } from '~~/server/utils/db'
import { paginatedSchema } from '~~/server/utils/pagination'

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
