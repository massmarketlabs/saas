import type { H3Event } from 'h3'
import { sql } from 'drizzle-orm'
import { createError, eventHandler, getQuery, getRouterParam } from 'h3'

import * as schema from '~~/server/database/schema'
import { isValidTable } from '~~/server/utils/db'

/**
 * Enum for relationship types
 */
enum RelationshipType {
  ManyToOne = 'manyToOne',
  OneToMany = 'oneToMany',
  OneToOne = 'oneToOne',
  ManyToMany = 'manyToMany'
}

/**
 * Interface for join metadata
 */
interface JoinInfo {
  sourceTable: string
  targetTable: string
  sourceColumn: string
  targetColumn: string
  relationship: RelationshipType
}

/**
 * Type for join result structure
 */
type JoinResult = Record<string, JoinInfo[]>

/**
 * Interface for foreign key constraint row from database
 */
interface FKConstraintRow {
  constraint_name: string
  source_table: string
  source_column: string
  target_table: string
  target_column: string
}

/**
 * Interface for the aggregate root data response
 */
interface AggregateRootResponse {
  rootTable: string
  data: Record<string, any>
  // rootData: any[]
  // relatedData: Record<string, any[]>
}

/**
 * Type guard to check if a key exists in schema
 */
function isSchemaTable(key: string, obj: any): key is keyof typeof schema {
  return key in obj && typeof obj[key] === 'object' && obj[key] !== null
}

/**
 * Helper to check if a column name likely indicates a foreign key (common naming patterns)
 */
function isForeignKeyColumn(columnName: string): boolean {
  return columnName.endsWith('_id') || columnName.endsWith('Id')
}

/**
 * Extract base name from a foreign key column name
 */
function getBaseColumnName(columnName: string): string | null {
  if (columnName.endsWith('_id')) {
    return columnName.substring(0, columnName.length - 3)
  }
  else if (columnName.endsWith('Id')) {
    return columnName.substring(0, columnName.length - 2).toLowerCase()
  }
  return null
}

/**
 * Check if a base column name might reference a table name
 */
function isPotentialTableReference(baseColumnName: string | null, tableName: string): boolean {
  if (!baseColumnName)
    return false

  return (
    baseColumnName === tableName
    || baseColumnName === tableName.toLowerCase()
    || baseColumnName === tableName.replace(/s$/, '').toLowerCase()
  )
}

/**
 * Function to analyze schema and identify possible joins for a table
 */
function findPossibleJoins(tableName: string): JoinResult {
  const result: JoinResult = {}

  if (!isSchemaTable(tableName, schema)) {
    return result
  }

  const table = schema[tableName]

  // Get all tables in the schema
  const allTables = Object.keys(schema).filter(key =>
    isSchemaTable(key, schema)
    && !['default'].includes(key)
  )

  // Find joins through foreign key analysis
  for (const targetTableName of allTables) {
    if (targetTableName === tableName || !isSchemaTable(targetTableName, schema))
      continue

    const targetTable = schema[targetTableName]
    const sourceTableColumns = Object.keys(table)
    const targetTableColumns = Object.keys(targetTable)

    const joins: JoinInfo[] = []

    // Check source table columns for potential foreign keys to target table
    for (const sourceColumn of sourceTableColumns) {
      if (isForeignKeyColumn(sourceColumn)) {
        const baseColumnName = getBaseColumnName(sourceColumn)

        // Check if this appears to reference the target table
        if (isPotentialTableReference(baseColumnName, targetTableName)) {
          joins.push({
            sourceTable: tableName,
            targetTable: targetTableName,
            sourceColumn,
            targetColumn: 'id', // Assuming primary key is 'id'
            relationship: RelationshipType.ManyToOne
          })
        }
      }
    }

    // Check target table columns for potential foreign keys to source table
    for (const targetColumn of targetTableColumns) {
      if (isForeignKeyColumn(targetColumn)) {
        const baseColumnName = getBaseColumnName(targetColumn)

        // Check if this appears to reference the source table
        if (isPotentialTableReference(baseColumnName, tableName)) {
          joins.push({
            sourceTable: tableName,
            targetTable: targetTableName,
            sourceColumn: 'id', // Assuming primary key is 'id'
            targetColumn,
            relationship: RelationshipType.OneToMany
          })
        }
      }
    }

    // Add joins if found
    if (joins.length > 0) {
      result[targetTableName] = joins
    }
  }

  return result
}

/**
 * Handler to find join metadata from database
 */
async function findDatabaseJoins(event: H3Event, tableName: string): Promise<JoinResult> {
  const db = await useDB(event)
  const result: JoinResult = {}

  try {
    // Query to get foreign key constraints from PostgreSQL information schema
    const queryResult = await db.execute(sql`
      SELECT
        tc.constraint_name,
        tc.table_name AS source_table,
        kcu.column_name AS source_column,
        ccu.table_name AS target_table,
        ccu.column_name AS target_column
      FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
      WHERE 
        tc.constraint_type = 'FOREIGN KEY' AND
        (tc.table_name = ${tableName} OR ccu.table_name = ${tableName}) AND
        tc.table_schema = current_schema()
    `)

    // Extract rows from query result, handling different possible return structures
    const fkConstraints = Array.isArray(queryResult)
      ? queryResult
      : 'rows' in queryResult ? queryResult.rows : []

    // Process the results
    for (const row of fkConstraints) {
      // Safely access properties using type assertion
      const constraint = row as unknown as FKConstraintRow
      const sourceTable = constraint.source_table
      const targetTable = constraint.target_table
      const sourceColumn = constraint.source_column
      const targetColumn = constraint.target_column

      // Determine which table is the related one
      const relatedTable = sourceTable === tableName ? targetTable : sourceTable

      if (!result[relatedTable]) {
        result[relatedTable] = []
      }

      // Determine relationship type (simplified logic - would need enhancement for real-world cases)
      let relationship: RelationshipType

      if (sourceTable === tableName) {
        relationship = RelationshipType.ManyToOne // This table references another
      } else {
        relationship = RelationshipType.OneToMany // Another table references this one
      }

      result[relatedTable].push({
        sourceTable: tableName,
        targetTable: relatedTable,
        sourceColumn: sourceTable === tableName ? sourceColumn : targetColumn,
        targetColumn: sourceTable === tableName ? targetColumn : sourceColumn,
        relationship
      })
    }

    return result
  } catch (error) {
    console.error('Error fetching database join metadata:', error)
    // Fall back to schema analysis if database query fails
    return findPossibleJoins(tableName)
  }
}

/**
 * Fetch data for a table with optional conditions
 */
async function fetchTableData(
  event: H3Event,
  tableName: string,
  conditions: { column: string, value: any }[] = [],
  limit: number = 100
): Promise<any[]> {
  const db = await useDB(event)

  try {
    // Build the query using drizzle's sql template literals
    const queryParts = [sql`SELECT * FROM "${sql.raw(tableName)}"`]

    // Add WHERE conditions if any
    if (conditions.length > 0) {
      const whereConditions = conditions.map((condition) => {
        // Use parameterized queries for safety
        return sql`"${sql.raw(condition.column)}" = ${condition.value}`
      })

      // Join conditions with AND
      let whereClause = sql`WHERE `
      whereConditions.forEach((condition, index) => {
        if (index > 0) {
          whereClause = sql`${whereClause} AND `
        }
        whereClause = sql`${whereClause} ${condition}`
      })

      queryParts.push(whereClause)
    }

    // Add limit
    queryParts.push(sql`LIMIT ${limit}`)

    // Join all parts
    let finalQuery = queryParts[0]
    for (let i = 1; i < queryParts.length; i++) {
      finalQuery = sql`${finalQuery} ${queryParts[i]}`
    }

    // Execute the query
    const result = await db.execute(finalQuery)

    // Extract rows from the result
    return Array.isArray(result) ? result : 'rows' in result ? result.rows : []
  } catch (error) {
    console.error(`Error fetching data from table ${tableName}:`, error)
    return []
  }
}

/**
 * Fetch data for an aggregate root and its related entities
 */
async function fetchAggregateRoot(
  event: H3Event,
  tableName: string,
  joins: JoinResult,
  rootId?: string,
  limit: number = 50
): Promise<AggregateRootResponse> {
  // Result structure
  const result: AggregateRootResponse = {
    rootTable: tableName,
    data: {}
    // rootData: [],
    // relatedData: {}
  }

  // Initial conditions for root table query
  const rootConditions: { column: string, value: any }[] = []
  if (rootId) {
    rootConditions.push({ column: 'id', value: rootId })
  }

  // Fetch root table data
  // result.rootData = await fetchTableData(event, tableName, rootConditions, limit)
  const resp = await fetchTableData(event, tableName, rootConditions, limit)

  if (!resp) {
    return result
  }

  if (resp[0])
    result.data = { ...resp[0] }
  // Extract IDs from root data for use in related queries
  const rootIds = resp.map(item => item.id).filter(Boolean)

  // Process each related table
  for (const [relatedTable, joinInfos] of Object.entries(joins)) {
    if (!result.data[relatedTable]) {
      result.data[relatedTable] = []
    }

    // Process each join configuration for this related table
    for (const joinInfo of joinInfos) {
      // Skip if no valid root IDs
      if (rootIds.length === 0)
        continue

      if (joinInfo.relationship === RelationshipType.ManyToOne) {
        // This table has foreign keys to the related table
        // Extract all foreign key values from root data
        const foreignKeyValues = resp
          .map(item => item[joinInfo.sourceColumn])
          .filter(value => value !== null && value !== undefined)

        // Skip if no valid foreign keys
        if (foreignKeyValues.length === 0)
          continue

        // Fetch all related records at once with an IN condition
        try {
          const db = await useDB(event)
          const sqlQuery = sql`
            SELECT * FROM "${sql.raw(joinInfo.targetTable)}" 
            WHERE "${sql.raw(joinInfo.targetColumn)}" IN (${sql.join(foreignKeyValues)})
            LIMIT ${limit}
          `

          const queryResult = await db.execute(sqlQuery)
          const relatedItems = Array.isArray(queryResult) ? queryResult : 'rows' in queryResult ? queryResult.rows : []
          result.data[relatedTable] = [...result.data[relatedTable], ...relatedItems]
        } catch (error) {
          console.error(`Error fetching related data for ${relatedTable}:`, error)
        }
      }
      else if (joinInfo.relationship === RelationshipType.OneToMany) {
        // Related table has foreign keys to this table
        // Fetch all related records at once with an IN condition
        try {
          const db = await useDB(event)
          const sqlQuery = sql`
            SELECT * FROM "${sql.raw(joinInfo.targetTable)}"
            WHERE "${sql.raw(joinInfo.targetColumn)}" IN (${sql.join(rootIds)})
            LIMIT ${limit}
          `

          const queryResult = await db.execute(sqlQuery)
          const relatedItems = Array.isArray(queryResult) ? queryResult : 'rows' in queryResult ? queryResult.rows : []
          result.data[relatedTable] = [...result.data[relatedTable], ...relatedItems]
        } catch (error) {
          console.error(`Error fetching related data for ${relatedTable}:`, error)
        }
      }
    }

    // Remove empty related data arrays
    // if (result.data[relatedTable].length === 0) {
    //   delete result.data[relatedTable]
    // }
  }

  return result
}

/**
 * Handler to get aggregate root data for a table and its related entities
 */
export default eventHandler(async (event: H3Event): Promise<AggregateRootResponse> => {
  const tableName = getRouterParam(event, 'tableName')
  const query = getQuery(event)

  // Parse query parameters
  const id = query.id?.toString()
  const limit = Number.parseInt(query.limit?.toString() || '50', 10)

  // Validate table name
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

  try {
    // Get joins information for the table
    const databaseJoins = await findDatabaseJoins(event, tableName)

    // Fall back to schema analysis if no database joins found
    const joins = Object.keys(databaseJoins).length > 0
      ? databaseJoins
      : findPossibleJoins(tableName)

    // Fetch aggregate root data
    const aggregateRoot = await fetchAggregateRoot(
      event,
      tableName,
      joins,
      id,
      limit
    )

    return aggregateRoot
  } catch (error) {
    console.error('Error fetching aggregate root data:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      data: 'ERROR_FETCHING_AGGREGATE_ROOT',
      message: `Failed to fetch aggregate root data for table '${tableName}'`
    })
  }
})
