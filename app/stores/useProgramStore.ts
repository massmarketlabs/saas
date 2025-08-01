// app/stores/useProgramStore.ts
import type { programs } from '~~/server/database/schema'
import { defineStore } from 'pinia'

type Programs = typeof programs.$inferSelect

export const useProgramStore = defineStore('programs', () => {
  const programs = ref<Programs[]>([])
  const loading = ref(false)
  const error = ref<Error | null>(null)

  async function fetchPrograms() {
    loading.value = true
    error.value = null
    try {
      const { data, error: fetchError } = await useFetch('/api/admin/programs', {
        key: 'programs',
        server: true
      })
      if (fetchError.value)
        throw fetchError.value

      programs.value = data.value || []
    } catch (err) {
      error.value = err as Error
    } finally {
      loading.value = false
    }
  }

  return {
    programs,
    loading,
    error,
    fetchPrograms
  }
})
