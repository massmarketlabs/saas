import { pgEnum } from 'drizzle-orm/pg-core'
// ========================
// Program Status Enum
// ========================
export const program_status_enum = pgEnum('status', ['active', 'inactive'])
