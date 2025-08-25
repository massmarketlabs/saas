<i18n src="../../i18n.json"></i18n>

<script setup lang="ts">
import { csvFormat } from 'd3-dsv'

type Enrollment = NonNullable<typeof data.value>['intervention_enrollment'][0]

definePageMeta({
  layout: false
})

const localePath = useLocalePath()
const { t } = useI18n()
const route = useRoute()
const toast = useToast()
const { id: programId, intervention_id } = route.params
const { data, refresh, pending } = await useFetch(`/api/admin/intervention/${intervention_id as ':id'}`, { key: `intervention-${intervention_id}`, cache: 'no-cache' })
const toDeleteEnrollment = ref<null | Enrollment>(null)
const isDeletePending = ref(false)
const confirmationModalToDeleteEnrollment = computed(() => !!toDeleteEnrollment.value)

// Ensure consistent data structure for SSR/Client
const instructors = computed(() => {
  if (!data.value?.intervention_enrollment)
    return []
  return data.value.intervention_enrollment.filter(el => el.user?.role === 'instructor')
})

const enrollments = computed(() => {
  if (!data.value?.intervention_enrollment)
    return []
  return data.value.intervention_enrollment.filter(el => el.user?.role === 'beneficiary')
})

const activeBeneficiaryIds = computed(() => enrollments.value.reduce((acc, curr) => {
  if (!curr.deleted_at) {
    acc.push(curr.user_id)
  }
  return acc
}, [] as string[]))

const activeInstructorIds = computed(() => instructors.value.reduce((acc, curr) => {
  if (!curr.deleted_at) {
    acc.push(curr.user_id)
  }
  return acc
}, [] as string[]))
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

const handleSetConfirmationModal = (enrollment: Enrollment) => {
  toDeleteEnrollment.value = enrollment
}

const handleSubmitDelete = async () => {
  try {
    isDeletePending.value = true
    if (!toDeleteEnrollment.value) {
      return
    }
    const resp = await $fetch('/api/admin/intervention/enroll', {
      method: 'DELETE',
      body: {
        id: toDeleteEnrollment.value.id
      }
    })
    toast.add({ color: 'success', title: `Deleted ${resp.deletedCount} beneficiaries from enrollment` })
    await refresh()
    toDeleteEnrollment.value = null
  } catch (error) {
    console.error(error)
    toast.add({ color: 'error', title: 'Encountering an unexpected error.', description: String(error) })
  } finally {
    isDeletePending.value = false
  }
}

const handleDownloadEnrollmentCSV = () => {
  const sheet = enrollments.value.map(x => (
    {
      id: x.id,
      intervention_id: x.intervention_id,
      intervention: data.value?.name,
      user_id: x.user_id,
      user: x.user.name,
      created_at: x.created_at,
      updated_at: x.updated_at,
      deleted_at: x.deleted_at
    }
  ))
  const rows = csvFormat(sheet)
  const blob = new Blob([rows], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${new Date().toUTCString()} - ${String(data.value?.name)} - Enrollments.csv`
  document.body.appendChild(link) // Append temporarily to allow click
  link.click()
  document.body.removeChild(link) // Remove after click
}
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

    <div class="space-y-6 max-w-7xl mx-auto">
      <!-- Intervention Header Card -->
      <UCard class="border-l-2 border-l-primary">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div class="flex gap-2">
              <h1 class="text-2xl font-bold dark:text-white">
                {{ data?.name || 'Loading...' }}
              </h1>
              <ModalEditIntervention
                :intervention="data"
                :pending="pending"
                @intervention-changed="async () => await refresh()"
              />
            </div>
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
                {{ enrollments.length }}
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
                {{ activeBeneficiaryIds.length }}
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
            :key="`beneficiaries-${enrollments.length}`"
            :items="enrollments"
            title="Beneficiaries"
            header-icon="i-lucide-users"
            empty-state-icon="i-lucide-users"
            empty-state-title="No beneficiaries yet"
            empty-state-description=""
          >
            <template #header-actions>
              <div class="flex flex-wrap gap-2">
                <ModalAddBeneficiaryToIntervention
                  :enlisted-beneficiaries="activeBeneficiaryIds"
                  @enrollment-change="async () => await refresh()"
                />
                <UButton
                  size="sm"
                  variant="outline"
                  icon="i-lucide-download"
                  label="Export"
                  :loading="pending"
                  @click="handleDownloadEnrollmentCSV"
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
                      <div class="flex gap-2">
                        <p class="font-medium">
                          {{ beneficiary?.user?.name || 'Unknown' }}
                        </p>
                        <UBadge
                          v-if="beneficiary?.deleted_at"
                          color="error"
                        >
                          Archived
                        </UBadge>
                      </div>
                      <p class="text-sm text-gray-500">
                        Created: {{ formatDate(beneficiary?.created_at) }}
                      </p>
                    </div>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <div class="text-right">
                    <UDropdownMenu
                      :items="[
                        [{ label: 'View Profile', icon: 'i-lucide-eye', onSelect: async () => await navigateTo(`/admin/organization/user/${beneficiary.user_id}`) }],
                        [{ label: 'Edit', icon: 'i-lucide-edit' }],
                        [{ label: 'Remove', icon: 'i-lucide-trash-2', color: 'error', onSelect: () => handleSetConfirmationModal(beneficiary as Enrollment) }]
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
              <ModalAddInstructorToIntervention
                :enlisted-instructors="activeInstructorIds"
                @instructor-enrollment-change="async () => await refresh()"
              />
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
                  <div class="flex gap-2">
                    <p class="font-medium">
                      {{ instructor?.user?.name || 'Unknown' }}
                    </p>
                    <UBadge
                      v-if="instructor?.deleted_at"
                      color="error"
                    >
                      Archived
                    </UBadge>
                  </div>
                </div>
                <UDropdownMenu
                  :items="[
                    [{ label: 'View Profile', icon: 'i-lucide-eye', onSelect: () => navigateTo(`/admin/organization/user/${instructor.user_id}`) }],
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
                <UModal
                  v-model:open="confirmationModalToDeleteEnrollment"
                  title="Are you sure?"
                  description="This action is permanent, any and all data attached to this enrollment will be deleted"
                  @update:open="(val) => {
                    if (!val) {
                      toDeleteEnrollment = null
                    }
                  }"
                >
                  <template #body>
                    <span><strong>Name:</strong> {{ toDeleteEnrollment?.user.name }}</span>
                  </template>
                  <template #footer>
                    <div class="flex gap-2 justify-items-end">
                      <UButton
                        variant="outline"
                        @click="toDeleteEnrollment = null"
                      >
                        Close
                      </UButton>
                      <UButton
                        color="error"
                        :loading="isDeletePending"
                        @click="handleSubmitDelete"
                      >
                        Delete
                      </UButton>
                    </div>
                  </template>
                </UModal>
              </div>
            </template>
          </CardExpandable>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>
