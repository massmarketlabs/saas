<script setup lang="ts">
import type { InternalApi } from 'nitropack'

const { id, data, getGradeColor } = defineProps<{ id: string, getGradeColor: (grade: string) => string, data?: InternalApi['/api/admin/user/:id']['get'] }>()

const route = useRoute()
const router = useRouter()

// Enrollment Data
const activeTab = computed({
  get() {
    return (route.query.enrollments as string) || 'current'
  },
  set(tab) {
    // Hash is specified here to prevent the page from scrolling to the top
    router.push({
      // path: '/components/tabs',
      query: { enrollments: tab }
      // hash: '#control-active-item'u
    })
  }
})
const interventions = computed(() => {
  if (!data || !data.intervention_enrollment)
    return []

  const interventions = data.intervention_enrollment.map(
    x => x.intervention
  )
  return interventions
})

const enrollmentTabs = ref([
  {
    key: 'current' as const,
    value: 'current' as const,
    slot: 'current' as const,
    label: 'Current Enrollments',
    data: interventions.value
      .filter(x => x.status === 'active')
      .map(intervention => ({
        id: intervention.id,
        course: intervention.name,
        startDate: intervention.start_date,
        status: 'Active',
        instructor: 'Mr. Batata',
        period: '2nd Period',
        room: 'Room 201',
        credits: 4
      }))
  },
  {
    key: 'previous' as const,
    value: 'previous' as const,
    slot: 'previous' as const,
    label: 'Previous Enrollments',
    data: interventions.value
      .filter(x => x.status !== 'active')
      .map(intervention => ({
        id: intervention.id,
        course: intervention.name,
        startDate: intervention.start_date,
        status: 'Active',
        instructor: 'Mr. Batata',
        period: '2nd Period',
        room: 'Room 201',
        credits: 4,
        finalGrade: 'A+',
        academicYear: 2025
      }))
  }
])
</script>

<template>
  <UCard class="shadow-lg border border-gray-200 rounded-xl overflow-hidden">
    <template #header>
      <div class="flex justify-between">
        <div class="flex items-center gap-3">
          <UIcon
            name="i-heroicons-academic-cap"
            class="text-indigo-600 text-xl"
          />
          <h2 class="text-lg font-semibold">
            Enrollments
          </h2>
        </div>
        <ModalManageEnrollments :user-id="id" />
      </div>
    </template>

    <UTabs
      v-model="activeTab"
      :items="enrollmentTabs"
    >
      <template #current="{ item }">
        <div
          v-if="item.data.length === 0"
          class="text-center my-6 space-y-2"
        >
          <Icon
            name="i-heroicons-academic-cap"
            class="text-indigo-600 text-xl rounded-full"
          />
          <p class="text-center text-xl font-bold text-gray-500">
            No current enrollments Found
          </p>
          <p class="text-center text-sm text-gray-500">
            Start by assigning user to an intervention
          </p>
        </div>
        <div
          v-else
          class="space-y-4"
        >
          <div
            v-for="enrollment in item.data"
            :key="enrollment.id"
            class="p-4 rounded-lg bg-accented"
          >
            <div class="flex justify-between items-start mb-2">
              <div>
                <h4 class="font-medium">
                  {{ enrollment.course }}
                </h4>
                <p class="text-sm text-gray-500">
                  {{ enrollment.instructor }}
                </p>
              </div>
              <UBadge
                :color="enrollment.status === 'Active' ? 'success' : 'neutral'
                "
                variant="subtle"
              >
                {{ enrollment.status }}
              </UBadge>
            </div>
            <div class="grid grid-cols-2 gap-4 text-sm text-gray-500">
              <div>
                <span class="font-medium">Period:</span>
                {{ enrollment.period }}
              </div>
              <div>
                <span class="font-medium">Room:</span>
                {{ enrollment.room }}
              </div>
              <div>
                <span class="font-medium">Start Date:</span>
                {{ formatDate(new Date(String(enrollment.startDate))) }}
              </div>
              <div>
                <span class="font-medium">Credits:</span>
                {{ enrollment.credits }}
              </div>
            </div>
          </div>
        </div>
      </template>

      <template #previous="{ item }">
        <div
          v-if="item.data.length === 0"
          class="text-center my-6 space-y-2"
        >
          <Icon
            name="i-heroicons-academic-cap"
            class="text-indigo-600 text-xl rounded-full"
          />
          <p class="text-center text-xl font-bold text-gray-500">
            No previous enrollments Found
          </p>
        </div>
        <div
          v-else
          class="space-y-4"
        >
          <div
            v-for="enrollment in item.data"
            :key="enrollment.id"
            class="p-4 rounded-lg bg-accented"
          >
            <div class="flex justify-between items-start mb-2">
              <div>
                <h4 class="font-medium">
                  {{ enrollment.course }}
                </h4>
                <p class="text-sm text-gray-500">
                  {{ enrollment.instructor }}
                </p>
              </div>
              <div class="text-right">
                <UBadge
                  color="neutral"
                  variant="subtle"
                >
                  Completed
                </UBadge>
                <div
                  class="text-lg font-semibold mt-1"
                  :class="getGradeColor(enrollment?.finalGrade)"
                >
                  {{ enrollment?.finalGrade }}
                </div>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4 text-sm text-gray-500">
              <div>
                <span class="font-medium">Period:</span>
                {{ enrollment.period }}
              </div>
              <div>
                <span class="font-medium">Year:</span>
                {{ enrollment?.academicYear }}
              </div>
              <div>
                <span class="font-medium">Credits Earned:</span>
                {{ enrollment.credits }}
              </div>
            </div>
          </div>
        </div>
      </template>
    </UTabs>
  </UCard>
</template>
