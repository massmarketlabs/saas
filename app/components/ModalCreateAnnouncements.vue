<script setup lang="ts">
import type { RequestInsertAnnouncement } from '~~/server/internal/intervention/zod-types'
import { insertAnnouncement } from '~~/server/internal/intervention/zod-types'

const props = defineProps<{ interventionId?: string }>()
const emits = defineEmits(['change'])

const form = useTemplateRef('announcemnt-form')

const { user } = useAuth()
const toast = useToast()

const state = reactive<Partial<RequestInsertAnnouncement>>({
  intervention_id: props.interventionId,
  created_by: user.value?.id
})

const handleSubmit = async (event: FormSubmitEvent<RequestInsertAnnouncement>) => {
  const body = event.data
  await $fetch('/api/lms/intervention/announcement', {
    method: 'post',
    body,
    onResponse: (r) => {
      if (r.error || !r.response.ok)
        return
      toast.add({ color: 'success', title: 'Announcement published', description: 'Emails will be sent out shortly' })
      emits('change')
    }
  })
}
</script>

<template>
  <UModal
    title="New Announcement"
    description="Easily publish to everyone"
  >
    <UButton
      variant="outline"
      icon="i-lucide-plus"
    >
      New
    </UButton>
    <template #body>
      <UForm
        ref="announcemnt-form"
        :schema="insertAnnouncement"
        :state="state"
        class="space-y-6"
        @submit="handleSubmit"
      >
        <UFormField
          name="title"
          required
          label="Title"
        >
          <UInput
            v-model="state.title"
            class="w-full"
            placeholder="Title"
            auto-focus
          />
        </UFormField>

        <UFormField
          name="body"
          required
          label="Announcement"
        >
          <UTextarea
            v-model="state.body"
            :rows="8"
            class="w-full"
            placeholder="What's on your mind?"
            auto-focus
          />
        </UFormField>
      </UForm>
    </template>
    <template #footer="{ close }">
      <UButton
        variant="outline"
        color="error"
        @click="close"
      >
        Cancel
      </UButton>
      <UButton
        label="Submit"
        @click="form?.submit"
      />
    </template>
  </UModal>
</template>
