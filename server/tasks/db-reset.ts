import { reset } from 'drizzle-seed'
import * as schema from '~~/server/internal/'

export default defineTask({
  meta: {
    name: 'db:migrate',
    description: 'Run database migrations'
  },
  async run() {
    console.log('Running DB reset task...')
    try {
      const db = await useDB()

      const resp = await reset(db, schema)

      return { result: resp }
    } catch (err) {
      console.error({ err })

      return { result: null }
    }
  }
})
