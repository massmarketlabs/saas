import type { programs } from '~~/server/database/schema'
// app/stores/useProgramStore.ts
import { defineStore } from 'pinia'
import * as z from 'zod'

type Programs = typeof programs.$inferSelect

const schema = z.object({
  name: z.string().min(2)
})

type Schema = z.output<typeof schema>

export const useProgramStore = defineStore('programs', () => {
  const programs = ref<Programs[]>([])
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const state = reactive<Partial<Schema>>({})

  const toast = useToast()

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

  async function onSubmit(event: FormSubmitEvent<Schema>) {
    const resp = await useFetch('/api/admin/programs', { method: 'POST', body: event.data })
    if (resp.error.value) {
      toast.add({ title: 'Failed Request', color: 'error', description: resp.error.value?.message })
      return
    }
    toast.add({ title: 'Success', description: 'The form has been submitted.', color: 'success' })
    await fetchPrograms()
  }

  return {
    programs,
    loading,
    error,
    state,
    schema,
    fetchPrograms,
    onSubmit
  }
})
