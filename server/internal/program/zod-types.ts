import type { z } from 'zod/v4'
import { createInsertSchema } from 'drizzle-zod'
import * as schema from './schema'

// program.insert
export const insertProgramSchema = createInsertSchema(schema.programs)
export type RequestCreateProgram = z.infer<typeof insertProgramSchema>
