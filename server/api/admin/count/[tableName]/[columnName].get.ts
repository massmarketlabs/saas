import { getTableColumns, sql } from 'drizzle-orm'
import { z } from 'zod'
import * as schema from '~~/server/database/schema'
import { groupedColumnSchema, processFilters, withFilters } from '~~/server/database/utils'
import { isValidTable } from '~~/server/utils/db'

const pathSchema = z.object({
  tableName: z.string().min(1),
  columnName: z.string().min(1)
})

type DrizzleTable = Parameters<typeof getTableColumns>[0]

export default eventHandler(async (event) => {
  const params = await getValidatedRouterParams(event, pathSchema.parse)
  const query = await getValidatedQuery(event, groupedColumnSchema.parse)
  const { tableName, columnName } = params

  if (!isValidTable(tableName)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      data: 'INVALID_TABLE_NAME',
      message: 'Invalid Table Name'
    })
  }

  const table = schema[tableName] as unknown as DrizzleTable
  const columns = getTableColumns(table)

  if (!(columnName in columns)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      data: 'INVALID_COLUMN_NAME',
      message: 'Invalid Column Name'
    })
  }

  const db = await useDB(event)
  const columnKey = columnName as keyof typeof columns
  const column = columns[columnKey]

  const countQuery = db.select({ column, count: sql<number>`cast(count(*) as int)` })
    .from(table)
    .groupBy(column)
    .$dynamic()

  if (query?.filter) {
    const filters = processFilters(query.filter, columns)
    if (filters.length) {
      withFilters(countQuery, filters)
    }
  }

  const result = await countQuery
  return result
})
