import type { SQL } from 'drizzle-orm'
import type { NodePgDatabase } from 'drizzle-orm/node-postgres'
import type { PgColumn, PgSelect, PgTable } from 'drizzle-orm/pg-core'
import type * as schema from './schema'
import { and, asc, desc, eq, getTableColumns, gte, ilike, inArray, lte, sql } from 'drizzle-orm'
import { z } from 'zod/v4'

// utils
const filterItemSchema = z.union([
  z.object({
    col: z.string(),
    op: z.literal('between'),
    v: z.tuple([z.string(), z.string()])
  }),
  z.object({
    col: z.string(),
    op: z.literal('in'),
    v: z.array(z.string()).min(1)
  }),
  z.object({
    col: z.string(),
    op: z.literal('like'),
    v: z.string()
  }),
  z.object({
    col: z.string(),
    op: z.literal('eq'),
    v: z.string()
  })
] as const)

export const filterSchema = z.array(filterItemSchema)

export function processFilters(
  filters: z.infer<typeof filterSchema>,
  columns: Record<string, PgColumn>
): SQL[] {
  const sqlFilters: SQL[] = []

  for (const filter of filters) {
    if (filter.col in columns) {
      const columnKey = filter.col as keyof typeof columns
      const column = columns[columnKey]
      if (filter.op === 'between') {
        sqlFilters.push(
          and(
            gte(column, new Date(filter.v[0])),
            lte(column, new Date(filter.v[1]))
          )!
        )
      } else if (filter.op === 'in') {
        sqlFilters.push(
          inArray(column, filter.v)
        )
      } else if (filter.op === 'like') {
        sqlFilters.push(
          ilike(column, `%${filter.v}%`)
        )
      } else if (filter.op === 'eq') {
        sqlFilters.push(
          eq(column, filter.v)
        )
      }
    }
  }

  return sqlFilters
}

const sortSchema = z.array(
  z.tuple([
    z.string(),
    z.enum(['asc', 'desc'])
  ])
)

export const paginatedSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  filter: z.string()
    .transform((str) => {
      try {
        const parsed = JSON.parse(str)
        if (!Array.isArray(parsed))
          return []

        return parsed.reduce((validFilters, item) => {
          const result = filterSchema.element.safeParse(item)
          if (result.success) {
            validFilters.push(result.data)
          }
          return validFilters
        }, [])
      }
      catch {
        return []
      }
    })
    .optional(),
  sort: z.string()
    .transform((str) => {
      try {
        const parsed = JSON.parse(str)
        if (!Array.isArray(parsed))
          return []

        return parsed.reduce<z.infer<typeof sortSchema>>((validSorts, item) => {
          const result = sortSchema.element.safeParse(item)
          if (result.success) {
            validSorts.push(result.data)
          }
          return validSorts
        }, [])
      }
      catch {
        return []
      }
    })
    .optional()
})

// Filters
export function withFilters<T extends PgSelect>(
  qb: T,
  filters: SQL[]
) {
  return filters.length ? qb.where(and(...filters)) : qb
}

// Pagination
export const withPagination = (qb: PgSelect, limit: number, page: number) => {
  return qb.limit(limit).offset((page - 1) * limit)
}

// Sorting
export const withSorts = (qb: PgSelect, sorts: SQL[]) => {
  return qb.orderBy(...sorts)
}

export const handlePaginatedRequest = async (
  db: NodePgDatabase<typeof schema>,
  query: z.infer<typeof paginatedSchema>,
  table: PgTable
) =>
{
  const columns = getTableColumns(table)
  const listQuery = db.select().from(table).$dynamic()
  const totalQuery = db.select({ count: sql<number>`cast(count(*) as int)` }).from(table).$dynamic()

  if (query) {
    // Handle filters
    if (query.filter) {
      const filters = processFilters(query.filter, columns)
      withFilters(listQuery, filters)
      withFilters(totalQuery, filters)
    }
    // Handle sorting
    if (query.sort?.length) {
      const sorts: SQL[] = []
      for (const [field, direction] of query.sort) {
        if (field in columns) {
          const columnKey = field as keyof typeof columns
          const orderFunc = direction === 'desc' ? desc : asc
          sorts.push(orderFunc(columns[columnKey]))
        }
      }
      withSorts(listQuery, sorts)
    } else if ('id' in columns) {
      // Fallback sort to id desc
      const sorts: SQL[] = [desc(columns.id)]
      withSorts(listQuery, sorts)
    }
  }

  // Handle Pagination
  const page = query.page
  const limit = query.limit
  withPagination(listQuery, limit, page)
  const count = await totalQuery
  const result = await listQuery

  return {
    data: result,
    total: count[0]?.count || 0,
    page,
    limit
  }
}

// Grouped Column
// This is useful for creating filters on the UI end of the app

export const groupedColumnSchema = z.object({
  filter: z.string()
    .transform((str) => {
      try {
        const parsed = JSON.parse(str)
        if (!Array.isArray(parsed))
          return []

        return parsed.reduce((validFilters, item) => {
          const result = filterSchema.element.safeParse(item)
          if (result.success) {
            validFilters.push(result.data)
          }
          return validFilters
        }, [])
      }
      catch {
        return []
      }
    })
    .optional()
})
