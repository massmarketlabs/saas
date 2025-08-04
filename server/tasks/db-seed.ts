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
          absence_reasons: {
            count: 5
          },
          user: {
            columns: {
              role: f.valuesFromArray({ values: ['admin', 'instructor', 'beneficiary'] })
            }
          },
          programs: {
            count: 10
          }

        }))

      return { result: resp }
    } catch (err) {
      console.error({ err })

      return { result: null }
    }
  }
})
