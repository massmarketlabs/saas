<script setup lang="ts">
import type { InternalApi } from 'nitropack'
import type { RequestCreateIntervention } from '~~/server/database'
import { requestCreateInterventionSchema } from '~~/server/database'

const props = defineProps<{ intervention: InternalApi['/api/admin/intervention/:id']['get'] }>()
const emit = defineEmits(['interventionChanged'])
const requestFetch = useRequestFetch()
const form = useTemplateRef('edit-intervention-form')
// const { data: programs, pending: programsPending } = await useFetch('/api/admin/programs')
const { data: terms, pending: termsPending } = await useFetch('/api/admin/terms')

const state = reactive<Partial<RequestCreateIntervention>>({
  id: props.intervention?.id,
  name: props.intervention?.name,
  description: props.intervention?.description,
  term_id: props.intervention?.term_id,
  program_id: props.intervention?.program_id,
  created_by: props.intervention?.created_by
})
const toast = useToast()

async function onSubmit(event: FormSubmitEvent<RequestCreateIntervention>) {
  console.log({ event })
  console.log(event.data)
  await requestFetch('/api/admin/intervention', {
    method: 'patch',
    body: event.data,
    onRequestError: ({ error }) => {
      toast.add({ title: error.message })
    },
    onResponse: ({ response }) => {
      if (response?.ok) {
        toast.add({ title: 'Success', description: 'The form has been submitted.', color: 'success' })
        emit('interventionChanged')
      }
    }
  })
}
</script>

<template>
  <UModal
    title="Edit Intervention"
    description="Make changes to your intervention"
  >
    <UButton
      variant="outline"
      size="sm"
      icon="i-heroicons-pencil-square"
    />
    <template #body>
      <UForm
        ref="edit-intervention-form"
        :state="state"
        :schema="requestCreateInterventionSchema"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField
          label="Name"
          name="name"
        >
          <UInput
            v-model="state.name"
            class="w-full"
          />
        </UFormField>
        <UFormField
          label="Description"
          name="description"
        >
          <UTextarea
            v-model="state.description"
            class="w-full"
            :rows="8"
          />
        </UFormField>
        <!-- <UFormField
          label="Program"
          name="program_id"
        >
          <USelect
            v-model="state.program_id"
            :loading="programsPending"
            class="w-full"
            :items="programs?.map(x => ({ value: x.id, label: x.name }))"
          />
        </UFormField> -->
        <UFormField
          label="Term"
          name="term_id"
        >
          <USelect
            v-model="state.term_id"
            class="w-full"
            :loading="termsPending"
            :items="terms?.map(x => ({ value: x.id, label: x.name }))"
          />
        </UFormField>
      </UForm>
    </template>
    <template #footer>
      <UButton
        @click="form?.submit"
      >
        Submit
      </UButton>
    </template>
  </UModal>
</template>
