<i18n src="../i18n.json"></i18n>

<script setup lang="ts">
// import type { interventions, program_enrollment, programs, terms } from '~~/server/database/schema'
import { Placeholder } from '#components'
import { differenceInYears } from 'date-fns'

definePageMeta({
  layout: false
})

const localePath = useLocalePath()
const { t } = useI18n()
const route = useRoute()
const id = route.params.id

const requestFetch = useRequestFetch()
const { data } = await useAsyncData(`program-${id}`, async () => await requestFetch(`/api/admin/programs/${id}`))
const avgAge = computed(() => {
  if (!data.value?.program_enrollment?.length) {
    return 0
  }

  let totalAge = 0
  let validParticipants = 0

  data.value.program_enrollment.forEach((enrollment) => {
    const dob = enrollment.user.dob
    if (dob) {
      const age = differenceInYears(new Date(), new Date(dob))
      totalAge += age
      validParticipants++
    }
  })

  return validParticipants > 0 ? Math.round(totalAge / validParticipants) : 0
})

useHead({ title: `Programs | ${data.value?.name}` })

// Mock statistics data - replace with actual API call
const programStats = computed(() => ({
  totalEnrollments: data.value?.program_enrollment?.length || 0,
  activeEnrollments: data.value?.program_enrollment?.filter(e => e.status === 'active')?.length || 0,
  mostFrequentAbsences: [
    { reason: 'Illness', count: 15, percentage: 35 },
    { reason: 'Family Emergency', count: 8, percentage: 18 },
    { reason: 'Transportation', count: 7, percentage: 16 },
    { reason: 'Other', count: 13, percentage: 31 }
  ]
}))
</script>

<template>
  <NuxtLayout name="admin">
    <template #navRight>
      <UButton
        :to="localePath(`/admin/dashboard`)"
        variant="outline"
        color="neutral"
        icon="i-lucide-arrow-left"
        :label="t('global.page.back')"
      />
    </template>

    <div class="space-y-6">
      <!-- Program Header Card -->
      <UCard class="border-l-2 border-l-primary">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold dark:text-white">
              {{ data?.name }}
            </h1>
            <p
              v-if="data?.description"
              class="text-gray-500 mt-1"
            >
              {{ data?.description || 'No program description' }}
            </p>
          </div>
          <template v-if="data?.is_active">
            <div class="flex flex-wrap gap-2">
              <UBadge class="inline-flex text-center items-center px-3 py-1 rounded-full text-xs font-medium">
                Active Program
              </UBadge>
            </div>
          </template>
          <template v-else>
            <UBadge
              color="error"
              class="inline-flex text-center items-center px-3 py-1 rounded-full text-xs font-medium"
            >
              Inactive Program
            </UBadge>
          </template>
        </div>
      </UCard>

      <!-- Statistics Overview -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Total Enrollments -->
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
            <div class="ml-4">
              <p class="text-sm font-medium">
                Total Enrollments
              </p>
              <p class="text-2xl font-semibold text-gray-500">
                {{ programStats.totalEnrollments }}
              </p>
            </div>
          </div>
        </UCard>
        <!-- Active Enrollments -->
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
            <div class="ml-4">
              <p class="text-sm font-medium">
                Active Enrollments
              </p>
              <p class="text-2xl font-semibold text-gray-500">
                {{ programStats.activeEnrollments }}
              </p>
            </div>
          </div>
        </UCard>
        <!-- Avg. Age -->
        <UCard class="shadow-sm hover:shadow-md transition-shadow">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <Icon
                  name="i-lucide-cake"
                  class="text-yellow-600 w-4 h-4"
                />
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium">
                Avg. Age
              </p>
              <p class="text-2xl font-semibold text-gray-500">
                {{ avgAge }} year(s)
              </p>
            </div>
          </div>
        </UCard>
        <!-- Interventions -->
        <UCard class="shadow-sm hover:shadow-md transition-shadow">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Icon
                  name="i-lucide-activity"
                  class="text-green-600 w-4 h-4"
                />
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium">
                Interventions
              </p>
              <p class="text-2xl font-semibold text-gray-500">
                {{ data?.interventions?.length || 0 }}
              </p>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Column: Program Enrollment -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Program Enrollment Section -->
          <CardExpandable
            header-icon="i-lucide-users"
            title="Program Enrollment"
            :items="data?.program_enrollment ?? []"
            empty-state-icon="i-lucide-users"
            empty-state-title="No enrollments yet"
            empty-state-description="Get started by enrolling your first beneficiary in this program."
          >
            <template #header-actions>
              <div class="flex flex-wrap gap-2">
                <UModal
                  title="Enroll New Student"
                  description="Add a new student to this program"
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
            </template>

            <template #empty-action>
              <UButton
                icon="i-lucide-user-plus"
                label="Enroll Beneficiary"
              />
            </template>
            <template #item="enrollment">
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
                        Name: {{ enrollment.item.user.name }}
                      </p>
                      <template
                        v-if="enrollment.item.user.dob"
                      >
                        <p class="font-medium">
                          Age: <IntervalToNowWithYearsMonths :start="enrollment.item.user.dob" />
                        </p>
                      </template>
                      <div class="flex gap-2">
                        <p
                          v-if="enrollment.item.created_at"
                          class="text-sm text-gray-500"
                        >
                          Enrolled: {{ new Date(enrollment.item.created_at).toLocaleDateString() }}
                        </p>
                        <p class="text-sm text-gray-500">
                          <IntervalToNowWithYearsMonths :start="enrollment.item.created_at" />
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="[
                      enrollment.item.status === 'active' ? 'bg-success-100 text-success-800' : 'bg-gray-100 text-gray-800'
                    ]"
                  >
                    {{ enrollment.item.status }}
                  </span>
                  <UDropdownMenu
                    :items="[
                      [{ label: 'View Details', icon: 'i-lucide-eye' }],
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
            </template>
          </CardExpandable>
          <!-- Most Frequent Absences Statistics -->
          <UCard class="shadow-sm">
            <template #header>
              <div class="flex items-center gap-2">
                <Icon
                  class="text-primary w-5 h-5"
                  name="i-lucide-bar-chart-3"
                />
                <span class="font-bold text-xl">Most Frequent Marked Absences</span>
              </div>
            </template>

            <div class="space-y-4">
              <div
                v-for="absence in programStats.mostFrequentAbsences"
                :key="absence.reason"
                class="flex items-center justify-between p-3 bg-blend-lighten bg-accented rounded-lg"
              >
                <div class="flex-1">
                  <div class="flex items-center justify-between mb-1">
                    <span class="font-medium">{{ absence.reason }}</span>
                    <span class="text-sm font-medium">{{ absence.count }} occurrences</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div
                      class="bg-primary-500 h-2 rounded-full transition-all duration-300"
                      :style="{ width: `${absence.percentage}%` }"
                    />
                  </div>
                  <span class="text-xs text-gray-500 mt-1">{{ absence.percentage }}% of total absences</span>
                </div>
              </div>
            </div>
          </UCard>
        </div>

        <!-- Right Column: Terms and Interventions -->
        <div class="space-y-6">
          <!-- Interventions Section -->
          <CardExpandable
            :items="data?.interventions ?? []"
            title="Interventions"
            header-icon="i-lucide-zap"
            empty-state-icon="i-lucide-zap"
            empty-state-title="No interventions available"
          >
            <template #header-actions>
              <UModal
                title="Add an Intervention"
                description="Create a new intervention for this program"
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
            </template>

            <template #empty-action>
              <UButton
                icon="i-lucide-user-plus"
                label="Create an Intervention"
              />
            </template>
            <template #item="interventionItem">
              <div class="flex items-center justify-between">
                <div class="text-left flex-1 justify-start p-0 h-auto">
                  <p class="font-medium">
                    {{ interventionItem.item.name }}
                  </p>
                  <p class="font-medium text-gray-500 text-sm">
                    {{ interventionItem.item.term.name }}
                  </p>
                </div>
                <UDropdownMenu
                  :items="[
                    [
                      { label: 'View',
                        icon: 'i-lucide-eye',
                        onSelect: async () => await navigateTo(`/admin/programs/${interventionItem.item.program_id}/intervention/${interventionItem.item.id}`) }
                    ],
                    [
                      { label: 'Edit',
                        icon: 'i-lucide-edit'
                      }
                    ],
                    [
                      { label: 'Delete',
                        icon: 'i-lucide-trash-2',
                        color: 'error'
                      }
                    ]
                  ]"
                >
                  <UButton
                    icon="i-lucide-more-horizontal"
                    size="xs"
                    variant="ghost"
                    square
                    class="text-white-500"
                  />
                </UDropdownMenu>
              </div>
            </template>
          </CardExpandable>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>
