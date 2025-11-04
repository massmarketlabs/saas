import type { z } from 'zod/v4'
import { createInsertSchema } from 'drizzle-zod'
import * as schema from './schema'

export const createStorageRow = createInsertSchema(schema.storage)

export type CreateStorageRow = z.infer<typeof createStorageRow>
