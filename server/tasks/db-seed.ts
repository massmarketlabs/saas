import { seed } from 'drizzle-seed'
import { v4 as uuidV4 } from 'uuid'
import * as schema from '~~/server/database/schema'

export default defineTask({
  meta: {
    name: 'db:migrate',
    description: 'Run database migrations'
  },
  async run() {
    console.log('Running DB seed task...')
    try {
      const db = await useDB()

      const resp = await seed(db, schema, { count: 10 })
        .refine(f => ({
          approval_request: {
            columns: {
              id: f.valuesFromArray({
                isUnique: true,
                values: Array.from({ length: 1000 }, () => uuidV4())
              })
            }
          },
          relationships: {
            columns: {
              id: f.valuesFromArray({
                isUnique: true,
                values: Array.from({ length: 1000 }, () => uuidV4())
              }),
              relationship_type: f.valuesFromArray({ values: ['Parent', 'Child', 'Sibling'] })
            }
          },
          auditLog: {
            columns: {
              id: f.intPrimaryKey(),
              status: f.valuesFromArray({ values: ['success', 'pending', 'failure'] }),
              category: f.valuesFromArray({ values: ['auth', 'organization', 'enrollment', 'email', 'program'] })
            }
          },
          attendance: {
            count: 1000,
            columns: {
              id: f.valuesFromArray({
                isUnique: true,
                values: Array.from({ length: 1000 }, () => uuidV4())
              }),
              state: f.valuesFromArray({ values: ['untracked', 'present', 'absent', 'late'] }),
              note: f.loremIpsum({ sentencesCount: 2 })
            }
          },
          assignments: {
            columns: {
              id: f.valuesFromArray({
                isUnique: true,
                values: Array.from({ length: 1000 }, () => uuidV4())
              }),
              max_values: f.default({ defaultValue: 100 }),
              type: f.valuesFromArray({ values: ['quiz', 'document_upload'] })
            }
          },
          submissions: {
            columns: {
              id: f.valuesFromArray({
                isUnique: true,
                values: Array.from({ length: 1000 }, () => uuidV4())
              })
            }
          },
          evaluations: {
            columns: {
              id: f.valuesFromArray({
                isUnique: true,
                values: Array.from({ length: 1000 }, () => uuidV4())
              }),
              comment: f.loremIpsum(),
              letter_grade: f.valuesFromArray({
                values: ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F']
              }),
              grade: f.int({ minValue: 0, maxValue: 100 })
            }
          },
          emergency_contacts: {
            columns: {
              id: f.valuesFromArray({
                isUnique: true,
                values: Array.from({ length: 1000 }, () => uuidV4())
              }),
              name: f.fullName(),
              email: f.email(),
              phone: f.phoneNumber(),
              relationship: f.valuesFromArray({
                values: ['mother', 'father', 'sibling', 'friend', 'uncle', 'aunt']
              })
            }
          },
          session: {
            columns: {
              id: f.valuesFromArray({
                isUnique: true,
                values: Array.from({ length: 1000 }, () => uuidV4())
              })
            }
          },
          user: {
            count: 100,
            columns: {
              id: f.valuesFromArray({
                isUnique: true,
                values: Array.from({ length: 1000 }, () => uuidV4())
              }),
              name: f.fullName({ isUnique: true }),
              role: f.valuesFromArray({ values: ['admin', 'instructor', 'beneficiary'] }),
              dob: f.datetime(),
              image: f.default({ defaultValue: null }),
              gender: f.valuesFromArray({ values: ['male', 'female', 'other'] })
            }
          },
          programs: {
            count: 6,
            columns: {
              id: f.valuesFromArray({
                isUnique: true,
                values: Array.from({ length: 1000 }, () => uuidV4())
              }),
              name: f.valuesFromArray({
                isUnique: true,
                values: [
                  'Women Empowerment',
                  'Early Childhood',
                  'Entrepreneurship',
                  'Mental Health & Family Support',
                  'Emergency Relief',
                  'International Internship'
                ]
              }),
              description: f.loremIpsum({ sentencesCount: 5 })
            }
          },
          interventions: {
            columns: {
              id: f.valuesFromArray({
                isUnique: true,
                values: Array.from({ length: 1000 }, () => uuidV4())
              }),
              description: f.loremIpsum({ sentencesCount: 5 })
            }
          },
          intervention_enrollment: {
            columns: {
              id: f.valuesFromArray({
                isUnique: true,
                values: Array.from({ length: 1000 }, () => uuidV4())
              })
            }
          },
          terms: {
            count: 3,
            columns: {
              id: f.valuesFromArray({
                isUnique: true,
                values: Array.from({ length: 1000 }, () => uuidV4())
              })
            }
          },
          user_notes: {
            count: 100,
            columns: {
              title: f.loremIpsum({ sentencesCount: 2 }),
              description: f.loremIpsum({ sentencesCount: 5 }),
              priority: f.valuesFromArray({ values: ['high', 'medium', 'low'] })
            }
          }

        }))

      return { result: resp }
    } catch (err) {
      console.error({ err })

      return { result: null }
    }
  }
})
