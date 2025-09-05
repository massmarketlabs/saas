import type { SQL } from 'drizzle-orm'
import type { PgColumn, PgSelect } from 'drizzle-orm/pg-core'
import { and, eq, gte, ilike, inArray, lte, or } from 'drizzle-orm'
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
  }),
  z.object({
    col: z.string(),
    op: z.literal('comma-separated'),
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
      } else if (filter.op === 'comma-separated') {
        // Handle searching for a single value within a comma-separated database field
        // e.g., searching for 'admin' in a field containing 'admin,instructor,student'
        const searchValue = filter.v.trim()

        if (searchValue.length > 0) {
          // Create conditions to match the value in different positions within comma-separated string
          sqlFilters.push(
            or(
              eq(column, searchValue), // exact match (single value)
              ilike(column, `${searchValue},%`), // starts with value: 'admin,instructor'
              ilike(column, `%,${searchValue},%`), // middle value: 'student,admin,instructor'
              ilike(column, `%,${searchValue}`) // ends with value: 'instructor,admin'
            )!
          )
        }
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
