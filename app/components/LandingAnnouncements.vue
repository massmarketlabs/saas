<script setup lang="ts">
import type { InternalApi } from 'nitropack'

const props = defineProps<{ id: string, data?: InternalApi['/api/lms/intervention/:id']['post'] }>()
const emits = defineEmits(['refresh'])
useHead({
  title: props.data?.name || ''
})
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-2">
          <icon
            name="streamline-plump:announcement-megaphone-remix"
            class="w-5 h-5 text-primary"
          />
          <span class="font-bold text-xl">Announcements</span>
        </div>
        <ModalCreateAnnouncements
          :intervention-id="id as string"
          @change="emits('refresh')"
        />
      </div>
    </template>
    <UEmpty
      v-if="data?.announcements.length === 0"
      icon="streamline-plump:announcement-megaphone-remix"
      title="No announcments found"
    />
    <div
      v-else
      class="space-y-4"
    >
      <div
        v-for="announcement in props.data?.announcements"
        :key="announcement.id"
        class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
      >
        <!-- Header with title and date -->
        <div
          class="bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 p-4 border-b border-gray-200 dark:border-gray-700"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ announcement.title }}
              </h3>
              <div class="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                <div class="flex items-center gap-1">
                  <icon
                    name="material-symbols:calendar-today"
                    class="w-4 h-4"
                  />
                  {{ formatDate(new Date(announcement.created_at || '')) }}
                </div>
                <div class="flex items-center gap-1">
                  <icon
                    name="material-symbols:account-circle"
                    class="w-4 h-4"
                  />
                  {{ announcement.creator.name }}
                </div>
              </div>
            </div>
            <UBadge
              color="primary"
              variant="soft"
            >
              New
            </UBadge>
          </div>
        </div>

        <!-- Body content -->
        <div class="p-4">
          <p class="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
            {{ announcement.body }}
          </p>
        </div>

        <!-- Footer with actions -->
        <div class="bg-gray-50 dark:bg-gray-800/50 px-4 py-3 flex gap-2 border-t border-gray-200 dark:border-gray-700">
          <UButton
            icon="material-symbols:edit"
            color="gray"
            variant="ghost"
            size="sm"
            label="Edit"
          />
          <UButton
            icon="material-symbols:delete-outline"
            color="red"
            variant="ghost"
            size="sm"
            label="Delete"
          />
        </div>
      </div>
    </div>
  </UCard>
</template>
