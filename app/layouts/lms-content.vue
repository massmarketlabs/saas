<script setup lang="ts">
definePageMeta({
  layout: 'lms'
})

const route = useRoute()

const id = route.params.id as string

const { data, refresh } = await useFetch(`/api/lms/intervention/${id as ':id'}`, { method: 'post', key: `lms-intervention-${id}` })

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
      <slot
        :layout-data="data"
        :refresh="refresh"
      />
    </div>
  </UContainer>
</template>
