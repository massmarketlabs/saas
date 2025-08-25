<script setup lang="ts">
import type { RequestInsertUserNote } from '~~/server/database'
import { insertUserNote } from '~~/server/database'

const props = defineProps<{ beneficiaryId: string }>()
const emit = defineEmits(['noteAdded'])
const auth = useAuth()
const toast = useToast()
const form = useTemplateRef('create-profile-note')
const state = reactive<Partial<RequestInsertUserNote>>({ beneficiary_id: props.beneficiaryId, created_by: auth.user.value?.id, priority: 'medium' })

const onSubmit = async (event: FormSubmitEvent<RequestInsertUserNote>) => {
  console.log('submitting', event.data)
  await $fetch('/api/admin/user/note', {
    method: 'post',
    body: event.data,
    onResponseError: ({ error }) => {
      toast.add({ color: 'error', title: error?.message })
    },
    onResponse: ({ response }) => {
      if (response.ok) {
        toast.add({ color: 'success', title: 'Note Added' })
        emit('noteAdded')
      }
    }
  })
}
</script>

<template>
  <UModal
    title="Add Note"
    description="Add a note to profile"
  >
    <UButton
      color="primary"
      variant="outline"
      size="sm"
      icon="i-heroicons-plus"
    >
      Add Note
    </UButton>
    <template #body>
      <UForm
        ref="create-profile-note"
        class="space-y-4"
        :state="state"
        :schema="insertUserNote"
        @submit="onSubmit"
      >
        <UFormField
          name="title"
          label="Title"
        >
          <UInput
            v-model="state.title"
            placeholder="Title"
            class="w-full"
          />
        </UFormField>
        <UFormField
          name="description"
          label="Description"
        >
          <UTextarea
            v-model="state.description"
            placeholder="Description"
            class="w-full"
          />
          <template #help>
            Notes are permanent, they cannot be edited or deleted.
          </template>
        </UFormField>
        <UFormField
          name="priority"
          label="Priority"
        >
          <USelect
            v-model="state.priority"
            placeholder="Priority"
            class="w-full"
            :items="[{ label: 'High', value: 'high' }, { label: 'Medium', value: 'medium' }, { label: 'Low', value: 'low' }]"
          />
        </UFormField>
      </UForm>
    </template>
    <template #footer>
      <UButton @click="form?.submit">
        Submit
      </UButton>
    </template>
  </UModal>
</template>
