<i18n src="../../i18n.json"></i18n>

<script setup lang="ts">
import { Placeholder } from '#components'

definePageMeta({
  layout: false
})

const localePath = useLocalePath()
const { t } = useI18n()
const route = useRoute()
// const requestFetch = useRequestFetch()

const { id: programId, intervention_id } = route.params
// const { data } = await useAsyncData(`intervention-${intervention_id}`, () => requestFetch(`/api/admin/intervention/${intervention_id}`))
const { data } = await useFetch(`/api/admin/intervention/${intervention_id}`)

// Ensure consistent data structure for SSR/Client
const instructors = computed(() => {
  if (!data.value?.intervention_enrollment)
    return []
  return data.value.intervention_enrollment.filter(el => el.user?.role === 'instructor')
})

const beneficiaries = computed(() => {
  if (!data.value?.intervention_enrollment)
    return []
  return data.value.intervention_enrollment.filter(el => el.user?.role === 'beneficiary')
})

// Date formatting utility to ensure consistency
const formatDate = (dateString: string | null | undefined) => {
  if (!dateString)
    return ''
  try {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(dateString))
  } catch (error) {
    console.error(error)
    console.warn('Invalid date:', dateString)
    return ''
  }
}

useHead({ title: `Intervention | ${data.value?.name ?? ''}` })
</script>

<template>
  <NuxtLayout name="admin">
    <template #navRight>
      <UButton
        :to="localePath(`/admin/programs/${programId}`)"
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
              {{ data?.name || 'Loading...' }}
            </h1>
            <p class="text-gray-500 mt-1">
              {{ data?.description || '' }}
            </p>
            <div class="flex items-center gap-4 mt-2">
              <span class="text-sm text-gray-600">
                Program: <strong>{{ data?.program?.name || 'N/A' }}</strong>
              </span>
              <span
                v-if="data?.term"
                class="text-sm text-gray-600"
              >
                Term:
                <strong>
                  {{ data.term.name }}
                  {{ formatDate(data.term.start_date) }} -
                  {{ formatDate(data.term.end_date) }}
                </strong>
              </span>
            </div>
          </div>
          <div class="flex flex-wrap gap-2">
            <UBadge class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium">
              {{ data?.status === 'active' ? 'Active' : 'Inactive' }}
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
                {{ beneficiaries.length }}
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
                {{ beneficiaries.length }}
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
              <p class="text-xl font-semibrel text-gray-500">
                {{ instructors.length }}
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
          <CardExpandable
            :key="`beneficiaries-${beneficiaries.length}`"
            :items="beneficiaries"
            title="Beneficiaries"
            header-icon="i-lucide-users"
            empty-state-icon="i-lucide-users"
            empty-state-title="No beneficiaries yet"
            empty-state-description=""
          >
            <template #header-actions>
              <div class="flex flex-wrap gap-2">
                <ModalAddBeneficiary />
                <UButton
                  size="sm"
                  variant="outline"
                  icon="i-lucide-download"
                  label="Export"
                />
              </div>
            </template>
            <template #item="{ item: beneficiary }">
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
                        {{ beneficiary?.user?.name || 'Unknown' }}
                      </p>
                      <p class="text-sm text-gray-500">
                        Enrolled: {{ formatDate(beneficiary?.created_at) }}
                      </p>
                    </div>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <div class="text-right">
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
            </template>
          </CardExpandable>
        </div>

        <!-- Right Column: Details -->
        <div class="space-y-6">
          <!-- Instructors -->
          <CardExpandable
            :key="`instructors-${instructors.length}`"
            header-icon="i-lucide-graduation-cap"
            :items="instructors"
            title="Instructors"
            empty-state-icon="i-lucide-graduation-cap"
            empty-state-title="No instructors assigned"
            empty-state-description=""
          >
            <template #header-actions>
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
            </template>

            <template #item="{ item: instructor }">
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
                      {{ instructor?.user?.name || 'Unknown' }}
                    </p>
                    <p class="text-sm text-gray-500">
                      {{ instructor?.user?.role || 'N/A' }}
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
            </template>
          </CardExpandable>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>
