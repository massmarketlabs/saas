import type { H3Event } from 'h3'
import { auditLog } from '../internal/auditLog/schema'
import { getDB } from './db'

export async function logAuditEvent(data: {
  userId?: string
  category: 'auth' | 'email' | 'payment' | 'organization' | 'enrollment' | 'users' | 'intervention'
  action: string
  targetType?: string
  targetId?: string
  ipAddress?: string
  userAgent?: string
  status?: 'success' | 'failure' | 'pending'
  details?: string
}) {
  try {
    const db = getDB()
    await db.insert(auditLog).values({
      userId: data.userId,
      category: data.category,
      action: data.action,
      targetType: data.targetType,
      targetId: data.targetId,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      status: data.status || 'success',
      details: data.details
    })
  } catch (error) {
    console.error('Failed to log audit event:', error)
  }
}
export type EventAuditParams = ReturnType<typeof extractAuditParams>

export function extractAuditParams(event: H3Event) {
  return {
    userAgent: event.headers.get('user-agent') || undefined,
    ipAddress: event.headers.get('x-forwarded-for')
      || event.headers.get('remoteAddress') || undefined
  }
}
