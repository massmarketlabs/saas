<script setup lang="ts">
import { z } from 'zod/v4'

definePageMeta({
  layout: 'lms'
})
const schema = z.object({
  syllabus: z.file()
})

type Schema = z.infer<typeof schema>

const state = reactive<Partial<Schema>>({})

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
            { label: 'Introduction Chapter ' }
          ]
        }
      ]
    }
  ]
])

const route = useRoute()

const onSubmit = (e: FormSubmitEvent<Schema>) => {
  console.log({ e: e.data.syllabus })
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
          title="No booksmarks found"
          description="Add items from this intervention to your bookmarks for easy access"
        />
      </div>
      <div v-else-if="route.hash === '#schedule'">
        <UCalendar variant="solid" />
      </div>
      <div
        v-else
        class="space-y-4"
      >
        <UForm
          :schema="schema"
          :state="state"
          class="space-y-4 w-96"
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

          <UButton
            type="submit"
            label="Submit"
            color="neutral"
          />
        </UForm>
      </div>
      <!-- <div class="flex justify-end"> -->
      <!--   <UButton -->
      <!--     icon="i-lucide-plus" -->
      <!--     variant="outline" -->
      <!--   > -->
      <!--     Add Section -->
      <!--   </UButton> -->
      <!-- </div> -->
    </div>
  </UContainer>
</template>
