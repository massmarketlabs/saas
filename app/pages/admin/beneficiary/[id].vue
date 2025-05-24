<script setup lang="ts">
import type { approval_request, beneficiary, beneficiary_relationships, emergency_contacts, intervention_enrollment, program_enrollment } from '~~/server/database/schema'

const route = useRoute()
const id = route.params.id
interface BeneficiaryAggregate {
  rootTable: string
  data: typeof beneficiary.$inferSelect &
    { approval_request: typeof approval_request.$inferSelect[] } &
    { beneficiary_relationships: typeof beneficiary_relationships.$inferSelect[] } &
    { emergency_contacts: typeof emergency_contacts.$inferSelect[] } &
    { intervention_enrollment: typeof intervention_enrollment.$inferSelect[] } &
    { program_enrollment: typeof program_enrollment.$inferSelect[] }
}

const { data, pending } = await useFetch<BeneficiaryAggregate>('/api/admin/aggregate/beneficiary', { query: { id } })
useHead({ title: pending.value ? 'Loading...' : `Beneficiary: ${data.value?.data.first_name_en} ${data.value?.data.last_name_en}` })
const localePath = useLocalePath()
const avatar_fallback = `${data.value?.data.first_name_en} ${data.value?.data?.last_name_en}`
</script>

<template>
  <NuxtLayout name="admin">
    <template #navRight>
      <UButton
        :to="localePath('/admin/beneficiary')"
        variant="outline"
        color="neutral"
        icon="i-lucide-arrow-left"
      >
        Back
      </UButton>
    </template>
    <!-- Beneficiary Image or Fallback -->
    <FlexThreeColumn class="mb-4 mt-2">
      <template #middle>
        <UAvatar
          :alt="avatar_fallback"
          size="lg"
        />
      </template>
    </FlexThreeColumn>
    <!-- Cards go here -->
    <!-- Profile Type -->
    <UCard class="mb-4">
      <template #header>
        <span class="text-2xl font-bold">
          Profile Information
        </span>
      </template>

      <!-- Basic Information -->
      <div class="space-y-4 mb-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
          Basic Information
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UInput
            :model-value="data?.data?.id"
            placeholder="ID"
            :ui="{ base: 'peer' }"
            size="md"
            disabled
          >
            <Label model-value="ID" />
          </UInput>
          <UInput
            :model-value="data?.data?.email"
            placeholder="Email Address"
            :ui="{ base: 'peer' }"
            size="md"
            disabled
          >
            <Label model-value="Email Address" />
          </UInput>
          <UInput
            :model-value="data?.data?.display_name"
            placeholder="Display Name"
            :ui="{ base: 'peer' }"
            size="md"
            disabled
          >
            <Label model-value="Display Name" />
          </UInput>
          <UInput
            :model-value="data?.data?.joined_at"
            placeholder="Joined At"
            :ui="{ base: 'peer' }"
            size="md"
            disabled
            type="date"
          >
            <Label model-value="Joined At" />
          </UInput>
        </div>
      </div>

      <!-- English Name -->
      <div class="space-y-4 mb-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
          Name (English)
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <UInput
            :model-value="data?.data?.first_name_en"
            placeholder="First Name (EN)"
            :ui="{ base: 'peer' }"
            size="md"
            disabled
          >
            <Label model-value="First Name" />
          </UInput>
          <UInput
            :model-value="data?.data?.middle_name_en"
            placeholder="Middle Name (EN)"
            :ui="{ base: 'peer' }"
            size="md"
            disabled
          >
            <Label model-value="Middle Name" />
          </UInput>
          <UInput
            :model-value="data?.data?.last_name_en"
            placeholder="Last Name (EN)"
            :ui="{ base: 'peer' }"
            size="md"
            disabled
          >
            <Label model-value="Last Name" />
          </UInput>
        </div>
      </div>

      <!-- Arabic Name -->
      <div class="space-y-4 mb-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
          Name (Arabic)
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <UInput
            :model-value="data?.data?.first_name_ar"
            placeholder="First Name (AR)"
            :ui="{ base: 'peer' }"
            size="md"
            disabled
          >
            <Label model-value="First Name" />
          </UInput>
          <UInput
            :model-value="data?.data?.middle_name_ar"
            placeholder="Middle Name (AR)"
            :ui="{ base: 'peer' }"
            size="md"
            disabled
          >
            <Label model-value="Middle Name" />
          </UInput>
          <UInput
            :model-value="data?.data?.last_name_ar"
            placeholder="Last Name (AR)"
            :ui="{ base: 'peer' }"
            size="md"
            disabled
          >
            <Label model-value="Last Name" />
          </UInput>
        </div>
      </div>

      <!-- Personal Details -->
      <div class="space-y-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
          Personal Details
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UInput
            :model-value="data?.data?.dob"
            type="date"
            placeholder="Date of Birth"
            :ui="{ base: 'peer' }"
            size="md"
            disabled
          >
            <Label model-value="Date of Birth" />
          </UInput>
          <UInput
            :model-value="data?.data?.phone"
            placeholder="Phone Number"
            :ui="{ base: 'peer' }"
            size="md"
            disabled
            type="tel"
          >
            <Label model-value="Phone Number" />
          </UInput>
          <div class="md:col-span-2">
            <UInput
              :model-value="data?.data?.address"
              placeholder="Address"
              :ui="{ base: 'peer' }"
              size="md"
              disabled
              class="w-full"
            >
              <Label model-value="Address" />
            </UInput>
          </div>
          <div class="md:col-span-2">
            <UInput
              :model-value="data?.data?.gid"
              placeholder="Government Issued Identification"
              :ui="{ base: 'peer' }"
              size="md"
              disabled
              class="w-full"
            >
              <Label model-value="Government Issued Identification" />
            </UInput>
          </div>
        </div>
      </div>
    </UCard>
    <!-- Program Enrollment -->
    <UCard class="mb-4">
      <template #header>
        <div class="flex items-center justify-between">
          <span>
            Program Enrollment
          </span>
          <UButton
            icon="i-lucide-plus"
            size="md"
          >
            Add
          </UButton>
        </div>
      </template>
      {{ data?.data.program_enrollment.length === 0 ? 'No Data Available' : null }}
    </UCard>
    <!-- Intervention Enrollment -->
    <UCard class="mb-4">
      <template
        #header
      >
        <div
          class="flex items-center justify-between"
        >
          <span>
            Intervention Enrollment
          </span>
          <UButton
            icon="i-lucide-plus"
            size="md"
          >
            Add
          </UButton>
        </div>
      </template>
      {{ data?.data.intervention_enrollment.length === 0 ? 'No Data Available' : null }}
    </UCard>
    <!-- Beneficiary Relationships -->
    <UCard class="mb-4">
      <template #header>
        <div
          class="flex items-center justify-between"
        >
          <span>
            Relationships
          </span>
          <UButton
            size="md"
            icon="i-lucide-plus"
          >
            Add
          </UButton>
        </div>
      </template>
      {{ data?.data.beneficiary_relationships.length === 0 ? 'No Data Available' : null }}
    </UCard>
    <!-- Emergency Contacts -->
    <UCard class="mb-4">
      <template #header>
        <div
          class="flex items-center justify-between"
        >
          <span>
            Emergency Contacts
          </span>
          <UButton
            size="md"
            icon="i-lucide-plus"
          >
            Add
          </UButton>
        </div>
      </template>
      {{ data?.data.emergency_contacts.length === 0 ? 'No Data Available' : null }}
    </UCard>
    <!-- Data Dump -->
    <UCard class="mb-4">
      <template #header>
        Raw Data
      </template>
      <pre>{{ JSON.stringify(data, null, '\t') }}</pre>
    </UCard>
    <!-- End of Cards -->
  </NuxtLayout>
</template>
