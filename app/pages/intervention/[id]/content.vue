<script setup lang="ts">
import type { RequestInsertSubject } from '~~/server/internal/intervention'
import { getLocalTimeZone, today } from '@internationalized/date'
import { insertSubject } from '~~/server/internal/intervention'

definePageMeta({
  layout: 'lms'
})

const route = useRoute()

const formRef = useTemplateRef('subject-create-form')
const id = route.params.id as string

const { data, refresh } = await useFetch(`/api/lms/intervention/${id as ':id'}`, { method: 'post', key: `lms-intervention-${id}` })

const state = reactive<RequestInsertSubject>({
  start_date: today(getLocalTimeZone()).toString(),
  end_date: today(getLocalTimeZone()).add({ weeks: 1 }).toString(),
  intervention_id: id,
  title: '',
  description: '',
  sort_order: data.value?.subjects.length ?? 0
})

const menu = computed<NavigationMenuItem[][]>(() => [
  [
    { label: 'Syllabus', icon: 'material-symbols:document-scanner-outline', to: '#syllabus' as const },
    { label: 'Bookmarks', icon: 'material-symbols:bookmarks-outline', to: '#bookmarks' as const },
    { label: 'Intervention Schedule', icon: 'i-lucide-calendar', to: '#schedule' as const }
  ],
  [
    {
      label: 'Table of Contents',
      to: '#toc',
      badge: '12',
      children: data.value?.subjects.map(subject => ({ label: subject.title, to: `#${subject.id}` as const }))
    }
  ]
])

const onSubmit = async (event: FormSubmitEvent<Partial<RequestInsertSubject>>) => {
  const resp = await $fetch('/api/lms/intervention/subject', { method: 'post', body: event.data })
  if (resp.success) {
    await refresh()
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
      <div
        v-show="route.hash === '#bookmarks'"
        id="bookmarks"
      >
        <UEmpty
          icon="i-lucide-bookmark"
          title="No bookmarks found"
          description="Add items from this intervention to your bookmarks for easy access"
        />
      </div>
      <div
        v-show="route.hash === '#schedule'"
        id="schedule"
      >
        <UCard>
          <UCalendar variant="solid" />
        </UCard>
      </div>

      <div
        v-show="route.hash === '#toc'"
        id="toc"
      >
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">
            Table of Contents
          </h3>
          <UModal
            title="Create a new subject"
            description="A subject is a collection of exams, assignments, and resources."
          >
            <UButton
              label="Add Subject"
              icon="i-lucide-plus"
            />
            <template #body>
              <UForm
                ref="subject-create-form"
                :state="state"
                :schema="insertSubject"
                class="space-y-4"
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
                    class="w-full"
                    placeholder="Description"
                    :rows="6"
                  />
                </UFormField>
                <UFormField
                  name="start_date"
                  label="Date Range"
                >
                  <DateRangePicker
                    v-model:start="state.start_date"
                    v-model:end="state.end_date"
                  />
                </UFormField>
              </UForm>
            </template>
            <template #footer="{ close }">
              <UButton
                variant="outline"
                @click="close"
              >
                Cancel
              </UButton>
              <UButton @click="formRef?.submit">
                Submit
              </UButton>
            </template>
          </UModal>
        </div>
        <UTree
          :items="data?.subjects.map(subject => ({
            label: subject.title,
            children: [
              { label: 'Assignment 1' }
            ]
          }))"
        />
      </div>
      <ClientOnly>
        <div v-show="data?.subjects.find(subject => `#${subject.id}` === route.hash)">
          {{ route.hash }}
        </div>
      </ClientOnly>

      <ContentSyllabus
        v-show="route.hash === '#syllabus' || !route.hash"
        :id="id"
        :data="data"
        @update="refresh"
      />
    </div>
  </UContainer>
</template>
