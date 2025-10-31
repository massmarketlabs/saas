<script setup lang="ts">
definePageMeta({
  layout: 'lms'
})

const route = useRoute()

const id = route.params.id as string

const { data, refresh } = await useFetch(`/api/lms/intervention/${id as ':id'}`, { method: 'post' })

const menu = ref<NavigationMenuItem[][]>([
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
      <ContentSyllabus
        v-else
        :id="id"
        :data="data"
        @update="refresh"
      />
    </div>
  </UContainer>
</template>
