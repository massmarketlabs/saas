import { seed } from 'drizzle-seed'
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

      const resp = await seed(db, schema, { count: 100 })
        .refine(f => ({
          auditLog: {
            columns: {
              id: f.intPrimaryKey(),
              status: f.valuesFromArray({ values: ['success', 'pending', 'failure'] })
            }
          },
          user: {
            columns: {
              id: f.uuid(),
              name: f.fullName({ isUnique: true }),
              role: f.valuesFromArray({ values: ['admin', 'instructor', 'beneficiary'] }),
              dob: f.datetime()
            }
          },
          programs: {
            count: 6,
            columns: {
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
          terms: {
            count: 20
          }

        }))

      return { result: resp }
    } catch (err) {
      console.error({ err })

      return { result: null }
    }
  }
})
