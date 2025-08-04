<i18n src="../i18n.json"></i18n>

<script setup lang="ts">
// import type { interventions, program_enrollment, programs, terms } from '~~/server/database/schema'
import { Placeholder } from '#components'

definePageMeta({
  layout: false
})

const localePath = useLocalePath()
const { t } = useI18n()
const route = useRoute()
const id = route.params.id

const requestFetch = useRequestFetch()
const { data } = await useAsyncData(`program-${id}`, async () => await requestFetch(`/api/admin/programs/${id}`))

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
              <UBadge class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium">
                Active Program
              </UBadge>
            </div>
          </template>
          <template v-else>
            <UBadge
              color="error"
              class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
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
        <!-- Terms -->
        <UCard class="shadow-sm hover:shadow-md transition-shadow">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <Icon
                  name="i-lucide-calendar"
                  class="text-yellow-600 w-4 h-4"
                />
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium">
                Terms
              </p>
              <p class="text-2xl font-semibold text-gray-500">
                {{ data?.terms?.length || 0 }}
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
          <UCard class="shadow-sm">
            <template #header>
              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div class="flex items-center gap-2">
                  <Icon
                    name="i-lucide-users"
                    class="w-5 h-5 text-primary"
                  />
                  <span class="font-bold text-xl">Program Enrollment</span>
                </div>
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
              </div>
            </template>

            <div
              v-if="!data?.program_enrollment || data.program_enrollment.length === 0"
              class="text-center py-12"
            >
              <Icon
                class="w-12 h-12 text-primary mx-auto mb-4"
                name="i-lucide-users"
              />
              <h3 class="text-lg font-medium mb-2">
                No enrollments yet
              </h3>
              <p class="text-gray-500 mb-4">
                Get started by enrolling your first beneficiary in this program.
              </p>
              <UButton
                icon="i-lucide-user-plus"
                label="Enroll Beneficiary"
              />
            </div>

            <div
              v-else
              class="space-y-3"
            >
              <div
                v-for="enrollment in data.program_enrollment"
                :key="enrollment.id"
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
                          Student ID: {{ enrollment.user_id }}
                        </p>
                        <p class="font-medium">
                          Name: {{ enrollment.user.name }}
                        </p>
                        <p class="text-sm text-gray-500">
                          Enrolled: {{ new Date(enrollment.created_at).toLocaleDateString() }}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <span
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      :class="[
                        enrollment.status === 'active' ? 'bg-success-100 text-success-800' : 'bg-gray-100 text-gray-800'
                      ]"
                    >
                      {{ enrollment.status }}
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
              </div>
            </div>
          </UCard>

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
          <!-- Terms Section -->
          <UCard class="shadow-sm">
            <template #header>
              <div class="flex flex-col gap-3">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <Icon
                      class="w-5 h-5 text-primary"
                      name="i-lucide-calendar"
                    />
                    <span class="font-bold text-xl">Terms</span>
                  </div>
                  <UDropdownMenu
                    :items="[
                      [{ label: 'Create Term', icon: 'i-lucide-plus' }],
                      [{ label: 'Import Terms', icon: 'i-lucide-upload' }]
                    ]"
                  >
                    <UButton
                      size="sm"
                      icon="i-lucide-plus"
                      :label="t('global.page.create')"
                      color="primary"
                    />
                  </UDropdownMenu>
                </div>
              </div>
            </template>

            <div
              v-if="!data?.terms || data.terms.length === 0"
              class="text-center py-8"
            >
              <Icon
                name="i-lucide-calendar"
                class="w-8 h-8 text-primary mx-auto mb-3"
              />
              <p class="text-gray-500 text-sm">
                No terms configured
              </p>
            </div>

            <div
              v-else
              class="space-y-3"
            >
              <div
                v-for="term in data.terms"
                :key="term.id"
                class="bg-accented rounded-lg p-3"
              >
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <p class="font-medium">
                      {{ term.name }}
                    </p>
                    <p class="text-sm text-gray-500">
                      {{ new Date(term.start_date).toLocaleDateString() }} -
                      {{ new Date(term.end_date).toLocaleDateString() }}
                    </p>
                  </div>
                  <UDropdownMenu
                    :items="[
                      [{ label: 'Edit', icon: 'i-lucide-edit' }],
                      [{ label: 'Delete', icon: 'i-lucide-trash-2', color: 'error' }]
                    ]"
                  >
                    <UButton
                      icon="i-lucide-more-horizontal"
                      size="xs"
                      variant="ghost"
                      class="text-white-500"
                      square
                    />
                  </UDropdownMenu>
                </div>
              </div>
            </div>
          </UCard>

          <!-- Interventions Section -->
          <UCard class="shadow-sm">
            <template #header>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <Icon
                    name="i-lucide-zap"
                    class="w-5 h-5 text-primary"
                  />
                  <span class="font-bold text-xl">Interventions</span>
                </div>
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
              </div>
            </template>

            <div
              v-if="!data?.interventions || data.interventions.length === 0"
              class="text-center py-8"
            >
              <Icon
                name="i-lucide-zap"
                class="w-8 h-8 text-primary mx-auto mb-3"
              />
              <p class="text-gray-500 text-sm">
                No interventions available
              </p>
            </div>

            <div
              v-else
              class="space-y-2"
            >
              <div
                v-for="interventionItem in data?.interventions"
                :key="interventionItem.id"
                class="group bg-accented rounded-lg p-3"
              >
                <div class="flex items-center justify-between">
                  <NuxtLink
                    variant="link"
                    :to="localePath(`/admin/programs/${id}/intervention/${interventionItem.id}`)"
                    class="text-left flex-1 justify-start p-0 h-auto"
                  >
                    <!-- <div class="flex items-center gap-2"> -->
                    <p class="font-medium">
                      {{ interventionItem.name }}
                    </p>
                    <p class="font-medium text-gray-500 text-sm">
                      {{ interventionItem.term.name }}
                    </p>
                    <!-- </div> -->
                  </NuxtLink>
                  <UDropdownMenu
                    :items="[
                      [
                        { label: 'View',
                          icon: 'i-lucide-eye',
                          onSelect: async () => await navigateTo(`/admin/programs/${interventionItem.program_id}/intervention/${interventionItem.name}`) }
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
              </div>
            </div>
          </UCard>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>
