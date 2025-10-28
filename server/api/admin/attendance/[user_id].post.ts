// server/api/attendance/[user_id].post.ts
import { desc, eq, sql } from 'drizzle-orm'
import * as schema from '~~/server/internal/schemas'

export default defineEventHandler(async (event) => {
  const __session = await requireAuth(event)
  const db = await useDB(event)

  const user_id = getRouterParam(event, 'user_id')

  if (!user_id) {
    throw createError({
      statusCode: 400,
      message: 'User ID is required'
    })
  }

  // --- Fetch attendance history ---
  const history = await db
    .select()
    .from(schema.attendance)
    .innerJoin(schema.interventions, eq(schema.attendance.intervention_id, schema.interventions.id))
    .where(eq(schema.attendance.user_id, user_id))
    .orderBy(desc(schema.attendance.scheduled_date))
    .limit(30) // fetch last 30 records

  // --- Compute statistics ---
  const counts = await db
    .select({
      status: schema.attendance.state,
      count: sql<number>`COUNT(*)`
    })
    .from(schema.attendance)
    .where(eq(schema.attendance.user_id, user_id))
    .groupBy(schema.attendance.state)

  const totalDays = counts.reduce((sum, c) => {
    if (c.status === 'untracked') {
      return sum
    }
    return sum + Number(c.count)
  }, 0)
  const present = counts.find(c => c.status === 'present')?.count ?? 0
  const absent = counts.find(c => c.status === 'absent')?.count ?? 0
  const late = counts.find(c => c.status === 'late')?.count ?? 0
  const untracked = counts.find(c => c.status === 'untracked')?.count ?? 0

  const attendanceRate = totalDays
    ? Math.round((present / totalDays) * 100)
    : 0

  // --- Compute streak ---
  const recent = await db
    .select({
      state: schema.attendance.state,
      date: schema.attendance.scheduled_date
    })
    .from(schema.attendance)
    .where(eq(schema.attendance.user_id, user_id))
    .orderBy(desc(schema.attendance.scheduled_date))

  let streak = 0
  for (const rec of recent) {
    if (rec.state === 'present')
      streak++
    else break
  }

  return {
    attendanceStats: {
      present,
      absent,
      late,
      untracked,
      totalDays,
      attendanceRate,
      streak
    },
    attendanceHistory: history
  }
})
