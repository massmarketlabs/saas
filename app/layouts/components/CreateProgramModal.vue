<script setup lang="ts">
import type { FormError } from '@nuxt/ui'
import * as z from 'zod'

type CreateProgramSchema = z.output<typeof schema>

const isOpen = ref(false)
const state = reactive<Partial<CreateProgramSchema>>({})

const schema = z.object({
  name: z.string().min(2)
})

const programStore = useProgramStore()

const toast = useToast()

const onSubmit = async (event: FormSubmitEvent<CreateProgramSchema>) => {
  const resp = await useFetch('/api/admin/programs', { method: 'POST', body: event.data })

  if (resp.error.value) {
    toast.add({ title: 'Failed Request', color: 'error', description: resp.error.value?.message })
    return
  }

  // Display Success Toast
  toast.add({ title: 'Success', description: 'The form has been submitted.', color: 'success' })

  // Refetch Programs
  await programStore.fetchPrograms()

  // Clear State
  state.name = undefined

  // Close Modal
  isOpen.value = false
}

const validate = (state: Partial<CreateProgramSchema>) => {
  const errors: FormError[] = []
  if (!state.name) {
    errors.push({ message: 'Name is required', name: 'name' })
  }
  return errors
}
</script>

<template>
  <UModal
    v-model="isOpen"
    title="Create a Program"
    description="Consectetur non sit labore nostrud consequat dolor aliquip ad consequat duis."
  >
    <UButton
      icon="i-lucide-plus"
      class="w-full justify-center"
      label="Add"
      @click="isOpen = true"
    />
    <template #body>
      <UForm
        :validate="validate"
        :state="state"
        :schema="schema"
        class="gap-4 flex flex-col w-60"
        @submit="onSubmit"
      >
        <UFormField
          label="Name"
          name="name"
        >
          <UInput
            v-model="state.name"
            placeholder="Program Name"
          />
        </UFormField>
        <div>
          <UButton type="submit">
            Submit
          </UButton>
        </div>
      </UForm>
    </template>
  </UModal>
</template>
