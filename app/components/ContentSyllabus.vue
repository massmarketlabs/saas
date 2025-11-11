<script setup lang="ts">
import type { InternalApi } from 'nitropack'
import { z } from 'zod/v4'

const { id, data } = defineProps<{ id: string, data?: InternalApi['/api/lms/intervention/:id']['post'] }>()
const emits = defineEmits(['update'])

const schema = z.object({
  syllabus: z.instanceof(File, { message: 'Please select a PDF file' })
})
type Schema = z.infer<typeof schema>

const state = reactive<Partial<Schema>>({})
const form = useTemplateRef('form-ref')
const fileManager = useFileManager()
const isLoadingUpload = ref(false)

const onSubmit = async (e: FormSubmitEvent<Schema>) => {
  try {
    isLoadingUpload.value = true

    // Upload to server
    const attachment = await fileManager.uploadToServer(e.data.syllabus, 'attachments')
    if (attachment && attachment[0]) {
      // Call API endpoint to finalize
      const resp = await $fetch(`/api/lms/intervention/${id}/syllabus`, {
        method: 'post',
        body: {
          attachmentId: attachment[0].id
        }
      })

      if (!resp)
        return
      // Update state and close edit mode
      // uploadedFile.value = e.data.syllabus
      state.syllabus = undefined
      emits('update')
    }
  } catch (error) {
    // useNuxtApp().$toast?.error('Failed to update syllabus')
    console.error('Syllabus upload error:', error)
  } finally {
    isLoadingUpload.value = false
  }
}
</script>

<template>
  <div
    id="syllabus"
    class="space-y-4"
  >
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-semibold">
        Syllabus
      </h3>
      <UModal title="Update Syllabus">
        <UButton
          icon="i-lucide-upload"
          label="Upload"
        />

        <template #body>
          <UForm
            ref="form-ref"
            :schema="schema"
            :state="state"
            class="space-y-4"
            @submit="onSubmit"
          >
            <UFormField
              name="syllabus"
              label="Syllabus"
              description="PDF. 2MB Max."
            >
              <UFileUpload
                v-model="state.syllabus"
                accept="application/pdf"
                class="min-h-48"
              />
            </UFormField>
          </UForm>
        </template>

        <template #footer="{ close }">
          <UButton
            label="Submit"
            :loading="isLoadingUpload"
            :disabled="!state.syllabus || isLoadingUpload"
            @click="form?.submit"
          />
          <UButton
            type="button"
            label="Cancel"
            variant="outline"
            :disabled="isLoadingUpload"
            @click="close"
          />
        </template>
      </UModal>
    </div>

    <embed
      v-if="data?.syllabus_src"
      :src="data.syllabus_src"
      width="100%"
      height="500px"
    >
    <UEmpty
      v-else
      icon="material-symbols:document-scanner-outline"
      title="No syllabus found"
    />
  </div>
</template>
