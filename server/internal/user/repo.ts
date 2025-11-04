import type { NodePgDatabase } from 'drizzle-orm/node-postgres'
import type { z } from 'zod/v4'
import type { paginatedSchema } from '~~/server/utils/pagination'

import type { RequestInsertRelationship, RequestInsertUserEmergencyContact } from './zod-types'

import * as schema from '..'
import { DrizzleCrudRepository } from '../../utils/crud-repository'

// database queries
export const authRepo = (db: NodePgDatabase<typeof schema>) => {
  const createEmergencyContact = async (contact: RequestInsertUserEmergencyContact) => {
    const repo = new DrizzleCrudRepository(db, schema.emergency_contacts)
    return await repo.create(contact)
  }
  const getById = async (id: string) => {
    const resp = await db.query.user.findFirst({
      where: (user, { eq }) => eq(user.id, id),
      with: {
        relationship_user: {
          with: {
            related_user: true
          }
        },
        emergency_contacts: true,
        beneficiary_notes: {
          with: {
            created_by: true,
            intervention: true
          }
        },
        intervention_enrollment: {
          with: {
            intervention: true
          }
        },
        submissions: {
          with: {
            assignment: {
              with: {
                intervention: true
              }
            },
            user: true,
            evaluations: {
              limit: 1

              // orderby: ({ created_at }, { desc }) => desc(created_at)
            }
          }
        }
        // evaluations: {
        //   with: {
        //     evaluator: true,
        //     submission: {
        //       with: {
        //         assignment: {
        //           with: {
        //             intervention: true
        //           }
        //         },
        //         user: true
        //       }
        //     }
        //   }
        // }
      }
    })
    return resp
  }

  const createRelationship = async (relationships: RequestInsertRelationship) => {
    const repo = new DrizzleCrudRepository(db, schema.relationships)

    const processedRelationships: RequestInsertRelationship = []
    const processRelationship = (r: string) => {
      switch (r) {
        case 'sibling':
          return 'sibling'
        case 'parent':
          return 'child'
        case 'child':
          return 'parent'
        default:
          return 'other'
      }
    }

    const processOppositeRelationship = (relationship: RequestInsertRelationship[number]): RequestInsertRelationship[number] => {
      return {
        ...relationship,
        user_id: relationship.related_user_id,
        related_user_id: relationship.user_id,
        relationship_type: processRelationship(relationship.relationship_type)
      }
    }

    for (const relationship of relationships) {
      processedRelationships.push(
        relationship,
        processOppositeRelationship(relationship)
      )
    }

    const resp = await repo.createMany(processedRelationships)
    return resp
  }

  return {
    getById,
    createEmergencyContact,
    createRelationship,
    list: async (query: z.infer<typeof paginatedSchema>) => {
      const repo = new DrizzleCrudRepository(db, schema.user)
      const resp = await repo.list(query)
      return resp
    }
  }
}
