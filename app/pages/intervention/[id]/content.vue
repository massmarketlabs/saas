<script setup lang="ts">
import { z } from 'zod/v4'

definePageMeta({
  layout: 'lms'
})

const route = useRoute()

const id = route.params.id

const { data, refresh } = await useFetch(`/api/lms/intervention/${id as ':id'}`, { method: 'post' })

const schema = z.object({
  syllabus: z.instanceof(File, { message: 'Please select a PDF file' })
})

type Schema = z.infer<typeof schema>

const state = reactive<Partial<Schema>>({})
const form = useTemplateRef('form-ref')
const fileManager = useFileManager()
const isLoadingUpload = ref(false)

const menu = ref<NavigationMenuItem[][]>([
  [
    { label: 'Syllabus', icon: 'material-symbols:document-scanner-outline', to: '#syllabus' as const },
    { label: 'Bookmarks', icon: 'material-symbols:bookmarks-outline', to: '#bookmarks' as const },
    { label: 'Intervention Schedule', icon: 'i-lucide-calendar', to: '#schedule' as const }
  ],
  [
    {
      label: 'Table of Contents',
      badge: '12',
      children: [
        {
          label: 'Week 1',
          children: [
            { label: 'Introduction Chapter' }
          ]
        }
      ]
    }
  ]
])

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
      refresh()
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
  <UContainer class="grid grid-cols-12 gap-4 min-h-0 flex-1">
    <div class="col-span-3 flex gap-2">
      <div class="flex-1">
        <UNavigationMenu
          :items="menu"
          orientation="vertical"
        />
      </div>
      <USeparator orientation="vertical" />
    </div>
    <div class="col-span-9">
      <div v-if="route.hash === '#bookmarks'">
        <UEmpty
          title="No bookmarks found"
          description="Add items from this intervention to your bookmarks for easy access"
        />
      </div>
      <div v-else-if="route.hash === '#schedule'">
        <UCard>
          <UCalendar variant="solid" />
        </UCard>
      </div>
      <div
        v-else
        class="space-y-4"
      >
        <!-- Display State -->
        <div class="space-y-4">
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
      </div>
    </div>
  </UContainer>
</template>
