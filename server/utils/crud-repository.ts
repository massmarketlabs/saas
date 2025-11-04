import type { SQL } from 'drizzle-orm'
import type { NodePgDatabase } from 'drizzle-orm/node-postgres'
import type { AnyPgTable, PgInsertValue, PgUpdateSetSource } from 'drizzle-orm/pg-core'
import type { z } from 'zod/v4'
import type * as schema from '../internal'
import type { paginatedSchema } from './pagination'
import { asc, desc, eq, getTableColumns, inArray, sql } from 'drizzle-orm'
import { processFilters, withFilters, withPagination, withSorts } from './pagination'

type InferSelectModel<T extends AnyPgTable> = T['$inferSelect']
type InferInsertModel<T extends AnyPgTable> = T['$inferInsert']

export class DrizzleCrudRepository<TTable extends AnyPgTable> {
  private db: NodePgDatabase<Partial<typeof schema>>
  private table: TTable
  private columns: ReturnType<typeof getTableColumns<TTable>>

  // 🔑 tiny helpers that “re-infer” the concrete table type
  private insert = <TT extends AnyPgTable>(table: TT) => this.db.insert(table)
  private update = <TT extends AnyPgTable>(table: TT) => this.db.update(table)
  private del = <TT extends AnyPgTable>(table: TT) => this.db.delete(table)
  private from = <TT extends AnyPgTable>(table: TT) => this.db.select().from(table as any)

  constructor(db: NodePgDatabase<Partial<typeof schema>>, table: TTable) {
    this.db = db
    this.table = table
    this.columns = getTableColumns(table)
  }

  async list(query: z.infer<typeof paginatedSchema>): Promise<{
    data: InferSelectModel<TTable>[]
    total: number
    page: number
    limit: number
  }> {
    const listQuery = this.from(this.table).$dynamic()
    const totalQuery = this.db.select({ count: sql<number>`cast(count(*) as int)` }).from(this.table as any).$dynamic()

    if (query) {
      // Handle filters
      if (query.filter) {
        const filters = processFilters(query.filter, this.columns)
        withFilters(listQuery, filters)
        withFilters(totalQuery, filters)
      }
      // Handle sorting
      if (query.sort?.length) {
        const sorts: SQL[] = []
        for (const [field, direction] of query.sort) {
          if (field in this.columns) {
            const columnKey = field as keyof typeof this.columns
            const orderFunc = direction === 'desc' ? desc : asc
            sorts.push(orderFunc(this.columns[columnKey]))
          }
        }
        withSorts(listQuery, sorts)
      } else if ('id' in this.columns) {
        // Fallback sort to id desc
        const sorts: SQL[] = [desc(this.columns.id)]
        withSorts(listQuery, sorts)
      }
    }

    // Handle Pagination
    const page = query.page
    const limit = query.limit
    withPagination(listQuery, limit, page)
    const [count, result] = await Promise.all([totalQuery, listQuery])

    return {
      data: result,
      total: count[0]?.count || 0,
      page,
      limit
    }
  }

  async findAll(): Promise<InferSelectModel<TTable>[]> {
    const result = await this.from(this.table) // ✅ uses helper
    return result as InferSelectModel<TTable>[]
  }

  async findById(id: string | number): Promise<InferSelectModel<TTable> | null> {
    if (!('id' in this.columns))
      throw new Error('Table does not have an id column')
    const result = await this
      .from(this.table)
      .where(eq(this.columns.id, id))
      .limit(1)
    return (result[0] as InferSelectModel<TTable>) ?? null
  }

  async create(data: InferInsertModel<TTable>) {
    const result = await this.insert(this.table) // ✅ helper makes conditional resolve
      .values(data as PgInsertValue<TTable>)
      .returning()
    return { success: true as const, data: result[0] as InferSelectModel<TTable> }
  }

  async createMany(data: InferInsertModel<TTable>[]) {
    if (data.length === 0)
      return { success: false as const, error: 'No data provided for creation' }
    const result = await this.insert(this.table)
      .values(data as PgInsertValue<TTable>[])
      .returning()
    return { success: true as const, data: result as InferSelectModel<TTable>[] }
  }

  async updateById(id: string | number, data: Partial<InferInsertModel<TTable>>) {
    if (!('id' in this.columns))
      return { success: false as const, error: 'Table does not have an id column' }
    const result = await this.update(this.table)
      .set(data as PgUpdateSetSource<TTable>)
      .where(eq(this.columns.id, id))
      .returning()

    if (result)
      return { success: false as const, error: 'Record not found' }
    return { success: true as const, data: result as InferSelectModel<TTable>[] }
  }

  async updateBy<K extends keyof InferSelectModel<TTable>>(
    column: K,
    value: InferSelectModel<TTable>[K],
    data: Partial<InferInsertModel<TTable>>
  ) {
    const columnName = String(column)
    if (!(columnName in this.columns))
      return { success: false as const, error: `Column ${columnName} does not exist in table` }
    const result = await this.update(this.table)
      .set(data as PgUpdateSetSource<TTable>)
      .where(eq(this.columns[columnName], value))
      .returning()
    return { success: true as const, data: result as InferSelectModel<TTable>[] }
  }

  async deleteById(id: string | number) {
    if (!('id' in this.columns))
      return { success: false as const, deletedCount: 0, error: 'Table does not have an id column' }
    const result = await this.del(this.table)
      .where(eq(this.columns.id, id))
      .returning()

    return { success: true as const, deletedCount: result.length }
  }

  async deleteBy<K extends keyof InferSelectModel<TTable>>(column: K, value: InferSelectModel<TTable>[K]) {
    const columnName = String(column)
    if (!(columnName in this.columns))
      return { success: false as const, deletedCount: 0, error: `Column ${columnName} does not exist in table` }
    const result = await this.del(this.table)
      .where(eq(this.columns[columnName], value))
      .returning()
    return { success: true as const, deletedCount: result.length }
  }

  async deleteByIds(ids: (string | number)[]) {
    if (!('id' in this.columns))
      return { success: false as const, deletedCount: 0, error: 'Table does not have an id column' }
    if (ids.length === 0)
      return { success: false as const, deletedCount: 0, error: 'No IDs provided for deletion' }
    const result = await this.del(this.table)
      .where(inArray(this.columns.id, ids))
      .returning()
    return { success: true as const, deletedCount: result.length }
  }

  getTableName(): string {
    return this.table._.name
  }
}
