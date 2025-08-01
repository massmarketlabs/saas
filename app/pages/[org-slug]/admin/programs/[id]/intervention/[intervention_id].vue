<i18n src="../../i18n.json"></i18n>

<script setup lang="ts">
// eslint-disable-next-line unused-imports/no-unused-imports
import type { interventions, program_enrollment, programs, terms } from '~~/server/database/schema'
import { Placeholder } from '#components'

// eslint-disable-next-line unused-imports/no-unused-vars
interface InterventionData {
  rootTable: string
  data: typeof interventions.$inferSelect & {
    program: typeof programs.$inferSelect
    term: typeof terms.$inferSelect
    // Add mock data interfaces
    instructors: Array<{
      id: string
      name: string
      email: string
      role: string
      avatar?: string
    }>
    beneficiaries: Array<{
      id: string
      name: string
      email: string
      status: 'active' | 'inactive'
      enrollment_date: string
      attendance_rate: number
    }>
    evaluations: Array<{
      id: string
      title: string
      type: 'quiz' | 'assignment' | 'exam'
      due_date: string
      status: 'pending' | 'graded' | 'draft'
      submissions: number
      total_participants: number
    }>
    schedule: {
      meeting_days: string[]
      start_time: string
      end_time: string
      timezone: string
    }
    location: {
      building: string
      room: string
      max_capacity: number
      current_occupancy: number
    }
    attendance: Array<{
      date: string
      present: number
      absent: number
      excused: number
      total: number
    }>
  }
}

definePageMeta({
  layout: false
})

const localePath = useLocalePath()
const { activeOrganization, sessionFetching } = useAuth()
const { t } = useI18n()
const route = useRoute()
const interventionId = route.params.interventionId
const programId = route.params.id

// Mock data fetch - replace with actual API call
// const { data } = await useFetch<InterventionData>('/api/admin/aggregate/interventions', {
//   query: { id: interventionId, programId }
// })

// Mock data for demonstration
const mockData = computed(() => ({
  data: {
    id: interventionId,
    name: 'Reading Comprehension Support',
    description: 'Intensive reading support intervention for struggling readers',
    status: 'active',
    created_at: '2024-09-01',
    program: {
      id: programId,
      name: 'Elementary Literacy Program',
      description: 'Supporting K-5 literacy development'
    },
    term: {
      id: '1',
      name: 'Fall 2024',
      start_date: '2024-09-01',
      end_date: '2024-12-20'
    },
    instructors: [
      {
        id: '1',
        name: 'Sarah Johnson',
        email: 'sarah.j@school.edu',
        role: 'Lead Instructor',
        avatar: null
      },
      {
        id: '2',
        name: 'Michael Chen',
        email: 'michael.c@school.edu',
        role: 'Assistant Instructor',
        avatar: null
      }
    ],
    beneficiaries: [
      {
        id: '1',
        name: 'Alex Martinez',
        email: 'alex.m@student.edu',
        status: 'active' as const,
        enrollment_date: '2024-09-01',
        attendance_rate: 92
      },
      {
        id: '2',
        name: 'Emma Thompson',
        email: 'emma.t@student.edu',
        status: 'active' as const,
        enrollment_date: '2024-09-05',
        attendance_rate: 88
      },
      {
        id: '3',
        name: 'Jordan Kim',
        email: 'jordan.k@student.edu',
        status: 'inactive' as const,
        enrollment_date: '2024-09-01',
        attendance_rate: 65
      }
    ],
    evaluations: [
      {
        id: '1',
        title: 'Mid-term Reading Assessment',
        type: 'exam' as const,
        due_date: '2024-11-15',
        status: 'pending' as const,
        submissions: 12,
        total_participants: 15
      },
      {
        id: '2',
        title: 'Weekly Comprehension Quiz',
        type: 'quiz' as const,
        due_date: '2024-10-25',
        status: 'graded' as const,
        submissions: 15,
        total_participants: 15
      }
    ],
    schedule: {
      meeting_days: ['Monday', 'Wednesday', 'Friday'],
      start_time: '10:00 AM',
      end_time: '11:30 AM',
      timezone: 'EST'
    },
    location: {
      building: 'Education Center',
      room: 'Room 205',
      max_capacity: 20,
      current_occupancy: 15
    },
    attendance: [
      { date: '2024-10-21', present: 14, absent: 1, excused: 0, total: 15 },
      { date: '2024-10-18', present: 13, absent: 2, excused: 0, total: 15 },
      { date: '2024-10-16', present: 15, absent: 0, excused: 0, total: 15 },
      { date: '2024-10-14', present: 12, absent: 2, excused: 1, total: 15 },
      { date: '2024-10-11', present: 14, absent: 1, excused: 0, total: 15 }
    ]
  }
}))

const interventionStats = computed(() => {
  const mock = mockData.value.data
  const avgAttendance = mock.attendance.reduce((acc, day) => acc + (day.present / day.total * 100), 0) / mock.attendance.length

  return {
    totalBeneficiaries: mock.beneficiaries.length,
    activeBeneficiaries: mock.beneficiaries.filter(b => b.status === 'active').length,
    avgAttendanceRate: Math.round(avgAttendance),
    completedEvaluations: mock.evaluations.filter(e => e.status === 'graded').length,
    totalEvaluations: mock.evaluations.length,
    capacityUtilization: Math.round((mock.location.current_occupancy / mock.location.max_capacity) * 100)
  }
})

useHead({ title: `Intervention | ${mockData.value.data.name}` })
</script>

<template>
  <NuxtLayout name="admin">
    <template #navRight>
      <UButton
        :to="localePath(`/${sessionFetching ? '' : activeOrganization?.slug}/admin/programs/${programId}`)"
        variant="outline"
        color="neutral"
        icon="i-lucide-arrow-left"
        :label="t('global.page.back')"
      />
    </template>

    <div class="space-y-6">
      <!-- Intervention Header Card -->
      <UCard class="border-l-2 border-l-primary">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold dark:text-white">
              {{ mockData.data.name }}
            </h1>
            <p class="text-gray-500 mt-1">
              {{ mockData.data.description }}
            </p>
            <div class="flex items-center gap-4 mt-2">
              <span class="text-sm text-gray-600">
                Program: <strong>{{ mockData.data.program.name }}</strong>
              </span>
              <span class="text-sm text-gray-600">
                Term: <strong>{{ mockData.data.term.name }}</strong>
              </span>
            </div>
          </div>
          <div class="flex flex-wrap gap-2">
            <UBadge class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium">
              {{ mockData.data.status === 'active' ? 'Active' : 'Inactive' }}
            </UBadge>
          </div>
        </div>
      </UCard>

      <!-- Statistics Overview -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <!-- Total Beneficiaries -->
        <UCard class="shadow-sm hover:shadow-md transition-shadow">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Icon
                  name="i-lucide-users"
                  class="text-blue-600 w-4 h-4"
                />
              </div>
            </div>
            <div class="ml-3">
              <p class="text-xs font-medium">
                Total Beneficiaries
              </p>
              <p class="text-xl font-semibold text-gray-500">
                {{ interventionStats.totalBeneficiaries }}
              </p>
            </div>
          </div>
        </UCard>

        <!-- Active Beneficiaries -->
        <UCard class="shadow-sm hover:shadow-md transition-shadow">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Icon
                  name="i-lucide-user-check"
                  class="text-green-600 w-4 h-4"
                />
              </div>
            </div>
            <div class="ml-3">
              <p class="text-xs font-medium">
                Active
              </p>
              <p class="text-xl font-semibold text-gray-500">
                {{ interventionStats.activeBeneficiaries }}
              </p>
            </div>
          </div>
        </UCard>

        <!-- Attendance Rate -->
        <UCard class="shadow-sm hover:shadow-md transition-shadow">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <Icon
                  name="i-lucide-calendar-check"
                  class="text-yellow-600 w-4 h-4"
                />
              </div>
            </div>
            <div class="ml-3">
              <p class="text-xs font-medium">
                Avg Attendance
              </p>
              <p class="text-xl font-semibold text-gray-500">
                {{ interventionStats.avgAttendanceRate }}%
              </p>
            </div>
          </div>
        </UCard>

        <!-- Evaluations -->
        <UCard class="shadow-sm hover:shadow-md transition-shadow">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Icon
                  name="i-lucide-clipboard-check"
                  class="text-purple-600 w-4 h-4"
                />
              </div>
            </div>
            <div class="ml-3">
              <p class="text-xs font-medium">
                Evaluations
              </p>
              <p class="text-xl font-semibold text-gray-500">
                {{ interventionStats.completedEvaluations }}/{{ interventionStats.totalEvaluations }}
              </p>
            </div>
          </div>
        </UCard>

        <!-- Capacity -->
        <UCard class="shadow-sm hover:shadow-md transition-shadow">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <Icon
                  name="i-lucide-building"
                  class="text-orange-600 w-4 h-4"
                />
              </div>
            </div>
            <div class="ml-3">
              <p class="text-xs font-medium">
                Capacity
              </p>
              <p class="text-xl font-semibold text-gray-500">
                {{ interventionStats.capacityUtilization }}%
              </p>
            </div>
          </div>
        </UCard>

        <!-- Instructors -->
        <UCard class="shadow-sm hover:shadow-md transition-shadow">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <Icon
                  name="i-lucide-graduation-cap"
                  class="text-indigo-600 w-4 h-4"
                />
              </div>
            </div>
            <div class="ml-3">
              <p class="text-xs font-medium">
                Instructors
              </p>
              <p class="text-xl font-semibold text-gray-500">
                {{ mockData.data.instructors.length }}
              </p>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Column: Main Content -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Beneficiaries List -->
          <UCard class="shadow-sm">
            <template #header>
              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div class="flex items-center gap-2">
                  <Icon
                    name="i-lucide-users"
                    class="w-5 h-5 text-primary"
                  />
                  <span class="font-bold text-xl">Beneficiaries</span>
                </div>
                <div class="flex flex-wrap gap-2">
                  <UModal
                    title="Add Beneficiary"
                    description="Add a new beneficiary to this intervention"
                  >
                    <UButton
                      size="sm"
                      icon="i-lucide-user-plus"
                      :label="t('global.page.create')"
                      color="primary"
                    />
                    <template #body>
                      <Placeholder class="h-64" />
                    </template>
                  </UModal>
                  <UButton
                    size="sm"
                    variant="outline"
                    icon="i-lucide-download"
                    label="Export"
                  />
                </div>
              </div>
            </template>

            <div class="space-y-3">
              <div
                v-for="beneficiary in mockData.data.beneficiaries"
                :key="beneficiary.id"
                class="bg-accented rounded-lg p-4"
              >
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div class="flex-1">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Icon
                          class="w-5 h-5 text-blue-600"
                          name="i-lucide-user"
                        />
                      </div>
                      <div>
                        <p class="font-medium">
                          {{ beneficiary.name }}
                        </p>
                        <p class="text-sm text-gray-500">
                          Enrolled: {{ new Date(beneficiary.enrollment_date).toLocaleDateString() }}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center gap-3">
                    <div class="text-right">
                      <p class="text-sm font-medium">
                        {{ beneficiary.attendance_rate }}% attendance
                      </p>
                      <div class="w-20 bg-gray-200 rounded-full h-1.5 mt-1">
                        <div
                          class="h-1.5 rounded-full transition-all duration-300"
                          :class="beneficiary.attendance_rate >= 80 ? 'bg-green-500' : beneficiary.attendance_rate >= 60 ? 'bg-yellow-500' : 'bg-red-500'"
                          :style="{ width: `${beneficiary.attendance_rate}%` }"
                        />
                      </div>
                    </div>
                    <span
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      :class="[
                        beneficiary.status === 'active' ? 'bg-success-100 text-success-800' : 'bg-gray-100 text-gray-800'
                      ]"
                    >
                      {{ beneficiary.status }}
                    </span>
                    <UDropdownMenu
                      :items="[
                        [{ label: 'View Profile', icon: 'i-lucide-eye' }],
                        [{ label: 'Edit', icon: 'i-lucide-edit' }],
                        [{ label: 'Remove', icon: 'i-lucide-trash-2', color: 'error' }]
                      ]"
                    >
                      <UButton
                        icon="i-lucide-more-horizontal"
                        size="sm"
                        class="text-white-500"
                        variant="ghost"
                        square
                      />
                    </UDropdownMenu>
                  </div>
                </div>
              </div>
            </div>
          </UCard>

          <!-- Attendance Tracking -->
          <UCard class="shadow-sm">
            <template #header>
              <div class="flex items-center gap-2">
                <Icon
                  class="text-primary w-5 h-5"
                  name="i-lucide-calendar-check"
                />
                <span class="font-bold text-xl">Recent Attendance</span>
              </div>
            </template>

            <div class="space-y-3">
              <div
                v-for="session in mockData.data.attendance"
                :key="session.date"
                class="bg-accented rounded-lg p-4"
              >
                <div class="flex items-center justify-between mb-3">
                  <span class="font-medium">{{ new Date(session.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' }) }}</span>
                  <span class="text-sm text-gray-500">{{ session.present }}/{{ session.total }} present</span>
                </div>
                <div class="grid grid-cols-3 gap-4 text-sm">
                  <div class="text-center">
                    <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-1">
                      <span class="text-green-600 font-semibold text-xs">{{ session.present }}</span>
                    </div>
                    <span class="text-gray-600">Present</span>
                  </div>
                  <div class="text-center">
                    <div class="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-1">
                      <span class="text-red-600 font-semibold text-xs">{{ session.absent }}</span>
                    </div>
                    <span class="text-gray-600">Absent</span>
                  </div>
                  <div class="text-center">
                    <div class="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-1">
                      <span class="text-yellow-600 font-semibold text-xs">{{ session.excused }}</span>
                    </div>
                    <span class="text-gray-600">Excused</span>
                  </div>
                </div>
              </div>
            </div>
          </UCard>

          <!-- Evaluations -->
          <UCard class="shadow-sm">
            <template #header>
              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div class="flex items-center gap-2">
                  <Icon
                    class="text-primary w-5 h-5"
                    name="i-lucide-clipboard-check"
                  />
                  <span class="font-bold text-xl">Evaluations</span>
                </div>
                <UModal
                  title="Create Evaluation"
                  description="Create a new evaluation for this intervention"
                >
                  <UButton
                    size="sm"
                    icon="i-lucide-plus"
                    :label="t('global.page.create')"
                    color="primary"
                  />
                  <template #body>
                    <Placeholder class="h-48" />
                  </template>
                </UModal>
              </div>
            </template>

            <div class="space-y-3">
              <div
                v-for="evaluation in mockData.data.evaluations"
                :key="evaluation.id"
                class="bg-accented rounded-lg p-4"
              >
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div class="flex-1">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <Icon
                          class="w-5 h-5 text-purple-600"
                          :name="evaluation.type === 'exam' ? 'i-lucide-file-text' : evaluation.type === 'quiz' ? 'i-lucide-help-circle' : 'i-lucide-clipboard'"
                        />
                      </div>
                      <div>
                        <p class="font-medium">
                          {{ evaluation.title }}
                        </p>
                        <p class="text-sm text-gray-500">
                          Due: {{ new Date(evaluation.due_date).toLocaleDateString() }}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center gap-3">
                    <div class="text-right">
                      <p class="text-sm font-medium">
                        {{ evaluation.submissions }}/{{ evaluation.total_participants }} submitted
                      </p>
                      <div class="w-20 bg-gray-200 rounded-full h-1.5 mt-1">
                        <div
                          class="bg-primary-500 h-1.5 rounded-full transition-all duration-300"
                          :style="{ width: `${(evaluation.submissions / evaluation.total_participants) * 100}%` }"
                        />
                      </div>
                    </div>
                    <span
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      :class="[
                        evaluation.status === 'graded' ? 'bg-success-100 text-success-800'
                        : evaluation.status === 'pending' ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      ]"
                    >
                      {{ evaluation.status }}
                    </span>
                    <UDropdownMenu
                      :items="[
                        [{ label: 'View Results', icon: 'i-lucide-eye' }],
                        [{ label: 'Edit', icon: 'i-lucide-edit' }],
                        [{ label: 'Delete', icon: 'i-lucide-trash-2', color: 'error' }]
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
        </div>

        <!-- Right Column: Details -->
        <div class="space-y-6">
          <!-- Instructors -->
          <UCard class="shadow-sm">
            <template #header>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <Icon
                    class="w-5 h-5 text-primary"
                    name="i-lucide-graduation-cap"
                  />
                  <span class="font-bold text-xl">Instructors</span>
                </div>
                <UModal
                  title="Assign Instructor"
                  description="Assign a new instructor to this intervention"
                >
                  <UButton
                    size="sm"
                    icon="i-lucide-plus"
                    :label="t('global.page.create')"
                    color="primary"
                  />
                  <template #body>
                    <Placeholder class="h-48" />
                  </template>
                </UModal>
              </div>
            </template>

            <div class="space-y-3">
              <div
                v-for="instructor in mockData.data.instructors"
                :key="instructor.id"
                class="bg-accented rounded-lg p-3"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <Icon
                        class="w-5 h-5 text-indigo-600"
                        name="i-lucide-user"
                      />
                    </div>
                    <div>
                      <p class="font-medium">
                        {{ instructor.name }}
                      </p>
                      <p class="text-sm text-gray-500">
                        {{ instructor.role }}
                      </p>
                    </div>
                  </div>
                  <UDropdownMenu
                    :items="[
                      [{ label: 'View Profile', icon: 'i-lucide-eye' }],
                      [{ label: 'Contact', icon: 'i-lucide-mail' }],
                      [{ label: 'Remove', icon: 'i-lucide-trash-2', color: 'error' }]
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
          </UCard>

          <!-- Schedule & Location -->
          <UCard class="shadow-sm">
            <template #header>
              <div class="flex items-center gap-2">
                <Icon
                  class="w-5 h-5 text-primary"
                  name="i-lucide-calendar-clock"
                />
                <span class="font-bold text-xl">Schedule & Location</span>
              </div>
            </template>

            <div class="space-y-4">
              <!-- Meeting Schedule -->
              <div class="bg-accented rounded-lg p-3">
                <div class="flex items-center gap-2 mb-2">
                  <Icon
                    class="w-4 h-4 text-primary"
                    name="i-lucide-clock"
                  />
                  <span class="font-medium">Meeting Times</span>
                </div>
                <p class="text-sm text-gray-600 mb-1">
                  {{ mockData.data.schedule.meeting_days.join(', ') }}
                </p>
                <p class="text-sm text-gray-600">
                  {{ mockData.data.schedule.start_time }} - {{ mockData.data.schedule.end_time }} ({{ mockData.data.schedule.timezone }})
                </p>
              </div>

              <!-- Location -->
              <div class="bg-accented rounded-lg p-3">
                <div class="flex items-center gap-2 mb-2">
                  <Icon
                    class="w-4 h-4 text-primary"
                    name="i-lucide-map-pin"
                  />
                  <span class="font-medium">Location</span>
                </div>
                <p class="text-sm text-gray-600 mb-1">
                  <strong>{{ mockData.data.location.building }}</strong>
                </p>
                <p class="text-sm text-gray-600 mb-2">
                  {{ mockData.data.location.room }}
                </p>
                <div class="flex items-center justify-between text-xs">
                  <span class="text-gray-500">Capacity:</span>
                  <span class="font-medium">{{ mockData.data.location.current_occupancy }}/{{ mockData.data.location.max_capacity }}</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                  <div
                    class="bg-primary-500 h-1.5 rounded-full transition-all duration-300"
                    :style="{ width: `${(mockData.data.location.current_occupancy / mockData.data.location.max_capacity) * 100}%` }"
                  />
                </div>
              </div>
            </div>
          </UCard>

          <!-- Term Information -->
          <UCard class="shadow-sm">
            <template #header>
              <div class="flex items-center gap-2">
                <Icon
                  class="w-5 h-5 text-primary"
                  name="i-lucide-calendar"
                />
                <span class="font-bold text-xl">Term</span>
              </div>
            </template>

            <div class="bg-accented rounded-lg p-3">
              <div class="flex items-center justify-between mb-2">
                <span class="font-medium">{{ mockData.data.term.name }}</span>
                <UButton
                  size="xs"
                  variant="outline"
                  icon="i-lucide-edit"
                />
              </div>
              <p class="text-sm text-gray-500">
                {{ new Date(mockData.data.term.start_date).toLocaleDateString() }} -
                {{ new Date(mockData.data.term.end_date).toLocaleDateString() }}
              </p>
            </div>
          </UCard>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>
