<script setup lang="ts">
import type { RequestInsertProgram } from '~~/server/database'
import { insertProgramSchema } from '~~/server/database'

const form = useTemplateRef('form')
const isOpen = ref(false)
const isLoading = ref(false)
const state = reactive<Partial<RequestInsertProgram>>({})
// const programStore = useProgramStore()
const { refresh } = await useProgramList()
const toast = useToast()

const onSubmit = async (event: FormSubmitEvent<RequestInsertProgram>) => {
  try {
    isLoading.value = true
    const resp = await $fetch('/api/admin/programs', { method: 'POST', body: event.data })

    if (!resp.success) {
      toast.add({ title: 'Failed Request', color: 'error', description: 'Unable to create program' })
      return
    }

    // Display Success Toast
    toast.add({ title: 'Success', description: 'The form has been submitted.', color: 'success' })

    // Refetch Programs
    // await programStore.query.execute()
    await refresh()

    // Clear State
    state.name = undefined
    state.description = undefined

    // Close Modal
    isOpen.value = false
  } catch (error) {
    console.error(error)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <UModal
    v-model:open="isOpen"
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
        ref="form"
        :state="state"
        :schema="insertProgramSchema"
        class="gap-4 flex flex-col"
        @submit="onSubmit"
      >
        <UFormField
          label="Name"
          name="name"
        >
          <UInput
            v-model="state.name"
            class="w-full"
            placeholder="Program Name"
          />
        </UFormField>
        <UFormField
          label="Description"
          name="description"
        >
          <UTextarea
            v-model="state.description"
            :maxrows="4"
            :rows="4"
            placeholder="Description"
            class="w-full"
          />
        </UFormField>
      </UForm>
    </template>
    <template #footer>
      <UButton
        :loading="isLoading"
        @click="form?.submit"
      >
        Submit
      </UButton>
    </template>
  </UModal>
</template>
