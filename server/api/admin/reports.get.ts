import type { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { and, count, gte, lt } from 'drizzle-orm'
import * as schema from '~~/server/internal'

interface ReportItem {
  total: number
  currentYear: number
  lastYear: number
  percentageChange: number
  trend: 'increase' | 'decrease' | 'no change'
}

async function generateUserReport(db: NodePgDatabase<typeof schema>): Promise<ReportItem> {
  // Calculate date ranges
  const now = new Date()
  const currentYear = now.getFullYear()
  const lastYear = currentYear - 1

  const currentYearStart = new Date(currentYear, 0, 1) // Jan 1st current year
  const lastYearStart = new Date(lastYear, 0, 1) // Jan 1st last year
  const lastYearEnd = new Date(currentYear, 0, 1) // Jan 1st current year (end of last year)

  // Get current year count (assuming you have a createdAt field)
  const currentYearUsers = await db
    .select({ count: count() })
    .from(schema.user)
    .where(gte(schema.user.createdAt, currentYearStart))

  // Get last year count
  const lastYearUsers = await db
    .select({ count: count() })
    .from(schema.user)
    .where(and(
      gte(schema.user.createdAt, lastYearStart),
      lt(schema.user.createdAt, lastYearEnd)
    ))

  // Get total count
  const totalUsers = await db
    .select({ count: count() })
    .from(schema.user)

  const currentCount = currentYearUsers?.[0]?.count || 0
  const lastCount = lastYearUsers?.[0]?.count || 0
  const totalCount = totalUsers?.[0]?.count || 0

  // Calculate percentage change
  const percentageChange = lastCount === 0
    ? (currentCount > 0 ? 100 : 0)
    : ((currentCount - lastCount) / lastCount) * 100
  return {
    total: totalCount || 0,
    currentYear: currentCount || 0,
    lastYear: lastCount || 0,
    percentageChange: Math.round(percentageChange * 100) / 100 || 0, // Round to 2 decimal places
    trend: percentageChange > 0 ? 'increase' : percentageChange < 0 ? 'decrease' : 'no change' as const
  }
}

async function generateInterventionReport(db: NodePgDatabase<typeof schema>): Promise<ReportItem> {
  // Calculate date ranges
  const now = new Date()
  const currentYear = now.getFullYear()
  const lastYear = currentYear - 1
  const currentYearStart = new Date(currentYear, 0, 1) // Jan 1st current year
  const lastYearStart = new Date(lastYear, 0, 1) // Jan 1st last year
  const lastYearEnd = new Date(currentYear, 0, 1) // Jan 1st current year (end of last year)

  // Convert dates to ISO strings for timestamp comparison
  const currentYearStartStr = currentYearStart.toUTCString()
  const lastYearStartStr = lastYearStart.toUTCString()
  const lastYearEndStr = lastYearEnd.toUTCString()

  // Get current year count - Fixed: using programs table and string dates
  const currentYearIntervention = await db
    .select({ count: count() })
    .from(schema.interventions)
    .where(gte(schema.interventions.created_at, currentYearStartStr))

  // Get last year count
  const lastYearIntervention = await db
    .select({ count: count() })
    .from(schema.interventions)
    .where(and(
      gte(schema.interventions.created_at, lastYearStartStr),
      lt(schema.interventions.created_at, lastYearEndStr)
    ))

  // Get total count
  const totalInterventions = await db
    .select({ count: count() })
    .from(schema.interventions)

  const currentCount = currentYearIntervention?.[0]?.count || 0
  const lastCount = lastYearIntervention?.[0]?.count || 0
  const totalCount = totalInterventions?.[0]?.count || 0

  // Calculate percentage change
  const percentageChange = lastCount === 0
    ? (currentCount > 0 ? 100 : 0)
    : ((currentCount - lastCount) / lastCount) * 100

  return {
    total: totalCount || 0,
    currentYear: currentCount || 0,
    lastYear: lastCount || 0,
    percentageChange: Math.round(percentageChange * 100) / 100 || 0, // Round to 2 decimal places
    trend: percentageChange > 0 ? 'increase' : percentageChange < 0 ? 'decrease' : 'no change' as const
  }
}

async function generateProgramReport(db: NodePgDatabase<typeof schema>): Promise<ReportItem> {
  // Calculate date ranges
  const now = new Date()
  const currentYear = now.getFullYear()
  const lastYear = currentYear - 1
  const currentYearStart = new Date(currentYear, 0, 1) // Jan 1st current year
  const lastYearStart = new Date(lastYear, 0, 1) // Jan 1st last year
  const lastYearEnd = new Date(currentYear, 0, 1) // Jan 1st current year (end of last year)

  // Convert dates to ISO strings for timestamp comparison
  const currentYearStartStr = currentYearStart.toUTCString()
  const lastYearStartStr = lastYearStart.toUTCString()
  const lastYearEndStr = lastYearEnd.toUTCString()

  // Get current year count - Fixed: using programs table and string dates
  const currentYearPrograms = await db
    .select({ count: count() })
    .from(schema.programs)
    .where(gte(schema.programs.created_at, currentYearStartStr))

  // Get last year count
  const lastYearPrograms = await db
    .select({ count: count() })
    .from(schema.programs)
    .where(and(
      gte(schema.programs.created_at, lastYearStartStr),
      lt(schema.programs.created_at, lastYearEndStr)
    ))

  // Get total count
  const totalPrograms = await db
    .select({ count: count() })
    .from(schema.programs)

  const currentCount = currentYearPrograms?.[0]?.count || 0
  const lastCount = lastYearPrograms?.[0]?.count || 0
  const totalCount = totalPrograms?.[0]?.count || 0

  // Calculate percentage change
  const percentageChange = lastCount === 0
    ? (currentCount > 0 ? 100 : 0)
    : ((currentCount - lastCount) / lastCount) * 100

  return {
    total: totalCount || 0,
    currentYear: currentCount || 0,
    lastYear: lastCount || 0,
    percentageChange: Math.round(percentageChange * 100) / 100 || 0, // Round to 2 decimal places
    trend: percentageChange > 0 ? 'increase' : percentageChange < 0 ? 'decrease' : 'no change' as const
  }
}

export default defineEventHandler(async (event) => {
  const __auth = requireAuth(event)
  const db = await useDB(event)
  const usersReport = await generateUserReport(db)
  const projectsReport = await generateProgramReport(db)
  const interventionReport = await generateInterventionReport(db)

  return {
    user: usersReport,
    program: projectsReport,
    intervention: interventionReport
  }
})
