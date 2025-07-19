import { desc, eq } from 'drizzle-orm'
import { member, organization } from '../schema'

export const getDefaultOrganization = async (userId: string) => {
  const db = await useDB()
  const organizations = await db
    .select()
    .from(organization)
    .innerJoin(member, eq(member.organizationId, organization.id))
    .where(eq(member.userId, userId))
    .orderBy(desc(member.createdAt))

  if (organizations.length === 0) {
    return null
  }
  return organizations[0].organization
}
