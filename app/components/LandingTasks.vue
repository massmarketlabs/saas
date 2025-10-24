<script setup lang="ts">
const upcomingTasks = [
  {
    id: 1,
    title: 'Submit Weekly Progress Report',
    dueDate: '2025-08-03',
    priority: 'high',
    intervention: 'Reading Comprehension Support',
    completed: false
  },
  {
    id: 2,
    title: 'Prepare Session Materials',
    dueDate: '2025-08-02',
    priority: 'medium',
    intervention: 'Math Skills Enhancement',
    completed: false
  },
  {
    id: 3,
    title: 'Student Assessment Review',
    dueDate: '2025-08-04',
    priority: 'medium',
    intervention: 'Social Skills Development',
    completed: true
  },
  {
    id: 4,
    title: 'Parent Conference Preparation',
    dueDate: '2025-08-06',
    priority: 'low',
    intervention: 'Reading Comprehension Support',
    completed: false
  }
]

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'bg-red-100 text-red-800'
    case 'medium': return 'bg-yellow-100 text-yellow-800'
    case 'low': return 'bg-green-100 text-green-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}
</script>

<template>
  <UCard class="shadow-sm">
    <template #header>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <Icon
            name="i-lucide-clipboard-list"
            class="w-5 h-5 text-primary"
          />
          <span class="font-bold text-xl">Tasks & Assignments</span>
        </div>
        <UButton
          size="sm"
          icon="i-lucide-plus"
          label="Add Task"
          color="primary"
        />
      </div>
    </template>

    <div class="space-y-3">
      <div
        v-for="task in upcomingTasks"
        :key="task.id"
        class="bg-accented rounded-lg p-3"
        :class="task.completed ? 'opacity-60' : ''"
      >
        <div class="flex items-start gap-3">
          <div class="flex-shrink-0 mt-1">
            <input
              type="checkbox"
              :checked="task.completed"
              class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            >
          </div>

          <div class="flex-1">
            <h4
              class="font-medium text-sm"
              :class="task.completed ? 'line-through' : ''"
            >
              {{ task.title }}
            </h4>
            <p class="text-xs text-gray-500 mt-1">
              {{ task.intervention }}
            </p>
            <div class="flex items-center gap-2 mt-2">
              <span
                class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                :class="getPriorityColor(task.priority)"
              >
                {{ task.priority }}
              </span>
              <span class="text-xs text-gray-500">
                Due: {{ new Date(task.dueDate).toLocaleDateString() }}
              </span>
            </div>
          </div>

          <UDropdownMenu
            :items="[
              [{ label: 'Edit', icon: 'i-lucide-edit' }],
              [{ label: 'Mark Complete', icon: 'i-lucide-check' }],
              [{ label: 'Delete', icon: 'i-lucide-trash-2', color: 'error' }]
            ]"
          >
            <UButton
              icon="i-lucide-more-horizontal"
              size="xs"
              variant="ghost"
              square
            />
          </UDropdownMenu>
        </div>
      </div>
    </div>

    <div class="mt-4 pt-3 border-t border-gray-200">
      <UButton
        variant="outline"
        size="sm"
        icon="i-lucide-external-link"
        label="View All Tasks"
        class="w-full"
      />
    </div>
  </UCard>
</template>
