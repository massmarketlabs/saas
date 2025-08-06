<!-- app/pages/index.vue -->
<i18n src="./i18n.json"></i18n>

<script setup lang="ts">
import { CalendarDate } from '@internationalized/date'

const localePath = useLocalePath()

definePageMeta({
  layout: false
})

const { user } = useAuth()
const { t } = useI18n()

const availableInterventions = [
  {
    id: 1,
    name: 'Reading Comprehension Support',
    description: 'Enhanced reading skills development program',
    status: 'active',
    participants: 12,
    nextSession: '2025-08-02T10:00:00Z',
    progress: 75
  },
  {
    id: 2,
    name: 'Math Skills Enhancement',
    description: 'Targeted mathematics intervention program',
    status: 'active',
    participants: 8,
    nextSession: '2025-08-03T14:00:00Z',
    progress: 60
  },
  {
    id: 3,
    name: 'Social Skills Development',
    description: 'Building interpersonal and communication skills',
    status: 'pending',
    participants: 15,
    nextSession: '2025-08-05T11:00:00Z',
    progress: 30
  }
]

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

const currentDate = shallowRef(new CalendarDate(2025, 8, 1))

// Calendar events/highlights
const calendarEvents = [
  {
    date: new CalendarDate(2025, 8, 2),
    type: 'session',
    title: 'Reading Comprehension Session'
  },
  {
    date: new CalendarDate(2025, 8, 3),
    type: 'task',
    title: 'Progress Report Due'
  },
  {
    date: new CalendarDate(2025, 8, 5),
    type: 'session',
    title: 'Social Skills Session'
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

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-success-100 text-success-800'
    case 'pending': return 'bg-yellow-100 text-yellow-800'
    case 'completed': return 'bg-blue-100 text-blue-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}
</script>

<template>
  <NuxtLayout name="default">
    <template #nav-right>
      <SiteNavigation
        :t="t"
        :locale-path="localePath"
      />
    </template>
    <div class="space-y-6">
      <!-- Welcome Header -->
      <UCard class="border-l-2 border-l-primary">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <Icon
                name="i-lucide-user"
                class="w-6 h-6 text-primary-600"
              />
            </div>
            <div>
              <h1 class="text-2xl font-bold dark:text-white">
                Welcome back, {{ user?.name }}
              </h1>
              <p class="text-gray-500 mt-1">
                {{ t(`roles.${user?.role}`) }} Dashboard • {{ new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}
              </p>
            </div>
          </div>
          <div class="flex gap-2">
            <UButton
              icon="i-lucide-bell"
              variant="outline"
              size="sm"
            />
            <UButton
              icon="i-lucide-settings"
              variant="outline"
              size="sm"
            />
          </div>
        </div>
      </UCard>

      <!-- Quick Stats -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <UCard class="shadow-sm hover:shadow-md transition-shadow">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Icon
                  name="i-lucide-zap"
                  class="text-blue-600 w-4 h-4"
                />
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium">
                Active Interventions
              </p>
              <p class="text-2xl font-semibold text-gray-500">
                {{ availableInterventions.filter(i => i.status === 'active').length }}
              </p>
            </div>
          </div>
        </UCard>

        <UCard class="shadow-sm hover:shadow-md transition-shadow">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Icon
                  name="i-lucide-users"
                  class="text-green-600 w-4 h-4"
                />
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium">
                Total Participants
              </p>
              <p class="text-2xl font-semibold text-gray-500">
                {{ availableInterventions.reduce((sum, i) => sum + i.participants, 0) }}
              </p>
            </div>
          </div>
        </UCard>

        <UCard class="shadow-sm hover:shadow-md transition-shadow">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <Icon
                  name="i-lucide-clock"
                  class="text-yellow-600 w-4 h-4"
                />
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium">
                Pending Tasks
              </p>
              <p class="text-2xl font-semibold text-gray-500">
                {{ upcomingTasks.filter(t => !t.completed).length }}
              </p>
            </div>
          </div>
        </UCard>

        <UCard class="shadow-sm hover:shadow-md transition-shadow">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Icon
                  name="i-lucide-calendar-days"
                  class="text-purple-600 w-4 h-4"
                />
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium">
                This Week
              </p>
              <p class="text-2xl font-semibold text-gray-500">
                {{ upcomingTasks.filter(t => new Date(t.dueDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)).length }}
              </p>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Column: Interventions -->
        <div class="lg:col-span-2 space-y-6">
          <!-- My Interventions -->
          <UCard class="shadow-sm">
            <template #header>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <Icon
                    name="i-lucide-zap"
                    class="w-5 h-5 text-primary"
                  />
                  <span class="font-bold text-xl">My Interventions</span>
                </div>
                <UButton
                  size="sm"
                  variant="outline"
                  icon="i-lucide-external-link"
                  label="View All"
                />
              </div>
            </template>

            <div class="space-y-4">
              <div
                v-for="intervention in availableInterventions"
                :key="intervention.id"
                class="bg-accented rounded-lg p-4 hover:shadow-sm transition-shadow"
              >
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2">
                      <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <Icon
                          name="i-lucide-zap"
                          class="w-5 h-5 text-primary-600"
                        />
                      </div>
                      <div>
                        <h3 class="font-medium">
                          {{ intervention.name }}
                        </h3>
                        <p class="text-sm text-gray-500">
                          {{ intervention.description }}
                        </p>
                      </div>
                    </div>

                    <div class="flex items-center gap-4 text-sm text-gray-500">
                      <span class="flex items-center gap-1">
                        <Icon
                          name="i-lucide-users"
                          class="w-3 h-3"
                        />
                        {{ intervention.participants }} participants
                      </span>
                      <span class="flex items-center gap-1">
                        <Icon
                          name="i-lucide-calendar"
                          class="w-3 h-3"
                        />
                        Next: {{ new Date(intervention.nextSession).toLocaleDateString() }}
                      </span>
                    </div>

                    <div class="mt-3">
                      <div class="flex items-center justify-between mb-1">
                        <span class="text-xs text-gray-600">Progress</span>
                        <span class="text-xs text-gray-600">{{ intervention.progress }}%</span>
                      </div>
                      <div class="w-full bg-gray-200 rounded-full h-2">
                        <div
                          class="bg-primary-500 h-2 rounded-full transition-all duration-300"
                          :style="{ width: `${intervention.progress}%` }"
                        />
                      </div>
                    </div>
                  </div>

                  <div class="flex items-center gap-2">
                    <span
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      :class="getStatusColor(intervention.status)"
                    >
                      {{ intervention.status }}
                    </span>
                    <UDropdownMenu
                      :items="[
                        [{ label: 'View Details', icon: 'i-lucide-eye' }],
                        [{ label: 'Edit Session', icon: 'i-lucide-edit' }],
                        [{ label: 'View Reports', icon: 'i-lucide-bar-chart' }]
                      ]"
                    >
                      <UButton
                        icon="i-lucide-more-horizontal"
                        size="sm"
                        variant="ghost"
                        square
                      />
                    </UDropdownMenu>
                  </div>
                </div>
              </div>
            </div>
          </UCard>

          <!-- Recent Activity -->
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
        </div>

        <!-- Right Column: Calendar and Tasks -->
        <div class="space-y-6">
          <!-- Calendar -->
          <UCard class="shadow-sm">
            <template #header>
              <div class="flex items-center gap-2">
                <Icon
                  name="i-lucide-calendar"
                  class="w-5 h-5 text-primary"
                />
                <span class="font-bold text-xl">Calendar</span>
              </div>
            </template>

            <UCalendar
              v-model="currentDate"
              :events="calendarEvents"
            />
          </UCard>

          <!-- Tasks & Assignments -->
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
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>
