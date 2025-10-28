import type { NodePgDatabase } from 'drizzle-orm/node-postgres'
import type { CreateStorageRow } from './zod-types'
import * as schema from '~~/server/internal/schemas'
import { DrizzleCrudRepository } from '~~/server/utils/crud-repository'

export const storageRepo = ({ db }: { db: NodePgDatabase<typeof schema> }) => {
  const crudRepo = new DrizzleCrudRepository(db, schema.storage)

  const create = async (payload: CreateStorageRow) => {
    return await crudRepo.create(payload)
  }

  const read = async (payload: { id: string }) => {
    const row = await crudRepo.findById(payload.id)
    return row
  }

  return {
    create,
    read
  }
}
