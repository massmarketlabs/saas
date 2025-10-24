<script setup lang="ts">
const recentActivity = [
  {
    id: 1,
    type: 'session_completed',
    message: 'Completed session for Reading Comprehension Support',
    timestamp: '2025-08-01T15:30:00Z'
  },
  {
    id: 2,
    type: 'task_assigned',
    message: 'New task assigned: Submit Weekly Progress Report',
    timestamp: '2025-08-01T09:15:00Z'
  },
  {
    id: 3,
    type: 'participant_joined',
    message: 'New participant joined Math Skills Enhancement',
    timestamp: '2025-07-31T14:20:00Z'
  }
]
</script>

<template>
  <UCard class="shadow-sm">
    <template #header>
      <div class="flex items-center gap-2">
        <Icon
          name="i-lucide-activity"
          class="w-5 h-5 text-primary"
        />
        <span class="font-bold text-xl">Recent Activity</span>
      </div>
    </template>

    <div class="space-y-3">
      <div
        v-for="activity in recentActivity"
        :key="activity.id"
        class="flex items-start gap-3 p-3 bg-accented rounded-lg"
      >
        <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
          <Icon
            :name="activity.type === 'session_completed' ? 'i-lucide-check-circle'
              : activity.type === 'task_assigned' ? 'i-lucide-clipboard' : 'i-lucide-user-plus'"
            class="w-4 h-4 text-blue-600"
          />
        </div>
        <div class="flex-1">
          <p class="text-sm font-medium">
            {{ activity.message }}
          </p>
          <p class="text-xs text-gray-500 mt-1">
            {{ new Date(activity.timestamp).toLocaleString() }}
          </p>
        </div>
      </div>
    </div>
  </UCard>
</template>
