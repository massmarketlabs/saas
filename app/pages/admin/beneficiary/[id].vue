<i18n src="./i18n.json"></i18n>

<script setup lang="ts">
import type { approval_request, beneficiary, beneficiary_relationships, emergency_contacts, intervention_enrollment, program_enrollment, programs } from '~~/server/database/schema'

interface BeneficiaryAggregate {
  rootTable: string
  data: typeof beneficiary.$inferSelect &
    { approval_request: typeof approval_request.$inferSelect[] } &
    { beneficiary_relationships: typeof beneficiary_relationships.$inferSelect[] } &
    { emergency_contacts: typeof emergency_contacts.$inferSelect[] } &
    { intervention_enrollment: typeof intervention_enrollment.$inferSelect[] } &
    { program_enrollment: typeof program_enrollment.$inferSelect[] }
}

const { t, locale } = useI18n()
const dir = getDirection(locale.value)

const route = useRoute()

const id = route.params.id

// Data Fetching
const { data, pending } = await useFetch<BeneficiaryAggregate>('/api/admin/aggregate/beneficiary', { query: { id } })
const { data: programList, pending: pendingProgramList } = await useFetch<{ data: typeof programs.$inferSelect[] }>('/api/admin/list/programs')

useHead({ title: pending.value ? 'Loading...' : `Beneficiary: ${data.value?.data.first_name_en} ${data.value?.data.last_name_en}` })
const localePath = useLocalePath()
const avatar_fallback = dir === 'ltr' ? `${data.value?.data.first_name_en} ${data.value?.data?.last_name_en}` : `${data.value?.data.first_name_ar} ${data.value?.data?.last_name_ar}`

function findProgram(id: string) {
  return programList.value?.data.find(x => x.id === id)
}
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
        {{ t('global.page.back') }}
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
    <!-- Profile Information Card -->
    <UCard class="mb-4">
      <template #header>
        <span class="text-2xl font-bold">
          {{ t('beneficiary.profile.profileInformation') }}
        </span>
      </template>

      <!-- Basic Information -->
      <div class="space-y-4 mb-6">
        <h3
          class="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2"
        >
          {{ t('beneficiary.profile.basicInformation') }}
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
            :placeholder="t('beneficiary.profile.emailAddress')"
            :ui="{ base: 'peer' }"
            size="md"
            disabled
          >
            <Label :model-value="t('beneficiary.profile.emailAddress')" />
          </UInput>
          <UInput
            :model-value="data?.data?.display_name"
            :placeholder="t('beneficiary.profile.displayName')"
            :ui="{ base: 'peer' }"
            size="md"
            disabled
          >
            <Label :model-value="t('beneficiary.profile.displayName')" />
          </UInput>
          <UInput
            :model-value="data?.data?.joined_at"
            :placeholder="t('beneficiary.profile.joinedAt')"
            :ui="{ base: 'peer' }"
            size="md"
            disabled
            type="date"
          >
            <Label :model-value="t('beneficiary.profile.joinedAt')" />
          </UInput>
        </div>
      </div>

      <!-- English Name -->
      <div class="space-y-4 mb-6">
        <h3
          class="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2"
        >
          {{ t('beneficiary.profile.nameEn.sectionLabel') }}
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <UInput
            :model-value="data?.data?.first_name_en"
            :placeholder="t('beneficiary.profile.nameEn.firstName')"
            :ui="{ base: 'peer' }"
            size="md"
            disabled
          >
            <Label :model-value="t('beneficiary.profile.nameEn.firstName')" />
          </UInput>
          <UInput
            :model-value="data?.data?.middle_name_en"
            :placeholder="t('beneficiary.profile.nameEn.middleName')"
            :ui="{ base: 'peer' }"
            size="md"
            disabled
          >
            <Label :model-value="t('beneficiary.profile.nameEn.middleName')" />
          </UInput>
          <UInput
            :model-value="data?.data?.last_name_en"
            :placeholder="t('beneficiary.profile.nameEn.lastName')"
            :ui="{ base: 'peer' }"
            size="md"
            disabled
          >
            <Label :model-value="t('beneficiary.profile.nameEn.lastName')" />
          </UInput>
        </div>
      </div>

      <!-- Arabic Name -->
      <div class="space-y-4 mb-6">
        <h3
          class="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2"
        >
          {{ t('beneficiary.profile.nameAr.sectionLabel') }}
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <UInput
            :model-value="data?.data?.first_name_ar"
            :placeholder="t('beneficiary.profile.nameAr.firstName')"
            :ui="{ base: 'peer' }"
            size="md"
            disabled
          >
            <Label :model-value="t('beneficiary.profile.nameAr.firstName')" />
          </UInput>
          <UInput
            :model-value="data?.data?.middle_name_ar"
            :placeholder="t('beneficiary.profile.nameAr.middleName')"
            :ui="{ base: 'peer' }"
            size="md"
            disabled
          >
            <Label :model-value="t('beneficiary.profile.nameAr.middleName')" />
          </UInput>
          <UInput
            :model-value="data?.data?.last_name_ar"
            :placeholder="t('beneficiary.profile.nameAr.lastName')"
            :ui="{ base: 'peer' }"
            size="md"
            disabled
          >
            <Label :model-value="t('beneficiary.profile.nameAr.lastName')" />
          </UInput>
        </div>
      </div>

      <!-- Personal Details -->
      <div class="space-y-4">
        <h3
          class="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2"
        >
          {{ t('beneficiary.profile.personalDetails') }}
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UInput
            :model-value="data?.data?.dob"
            type="date"
            :placeholder="t('beneficiary.profile.dob')"
            :ui="{ base: 'peer' }"
            size="md"
            disabled
          >
            <Label :model-value="t('beneficiary.profile.dob')" />
          </UInput>
          <UInput
            :model-value="data?.data?.phone"
            :placeholder="t('beneficiary.profile.phone')"
            :ui="{ base: 'peer' }"
            size="md"
            disabled
            type="tel"
          >
            <Label :model-value="t('beneficiary.profile.phone')" />
          </UInput>
          <div class="md:col-span-2">
            <UInput
              :model-value="data?.data?.address"
              :placeholder="t('beneficiary.profile.address')"
              :ui="{ base: 'peer' }"
              size="md"
              disabled
              class="w-full"
            >
              <Label :model-value="t('beneficiary.profile.address')" />
            </UInput>
          </div>
          <div class="md:col-span-2">
            <UInput
              :model-value="data?.data?.gid"
              :placeholder="t('beneficiary.profile.gid')"
              :ui="{ base: 'peer' }"
              size="md"
              disabled
              class="w-full"
            >
              <Label :model-value="t('beneficiary.profile.gid')" />
            </UInput>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end">
          <UButton variant="soft">
            {{ t('global.page.edit') }}
          </UButton>
        </div>
      </template>
    </UCard>
    <!-- Program Enrollment Card -->
    <UCard class="mb-4">
      <!-- Card Header -->
      <template #header>
        <div class="flex items-center justify-between">
          <!-- Title Label -->
          <span class="text-2xl font-bold">
            {{ t('beneficiary.profile.programEnrollment.sectionLabel') }}
          </span>
          <!-- Add Action -->
          <UButton
            icon="i-lucide-plus"
            size="md"
          >
            {{ t('beneficiary.actions.add') }}
          </UButton>
        </div>
      </template>
      <span v-if="data?.data && data.data.program_enrollment.length === 0">
        {{ t('global.data.empty') }}
      </span>
      <div v-else>
        <p v-if="pendingProgramList">
          Loading...
        </p>
        <ul v-else>
          <li
            v-for="(enrollment) in data!.data.program_enrollment"
            :key="enrollment.id"
          >
            <div class="flex gap-4">
              <span>
                {{ t('beneficiary.profile.nameEn.sectionLabel') }}: {{ findProgram(enrollment.program_id)?.name }}
              </span>
              <span>
                {{ t('global.page.createdAt') }}: {{ enrollment.created_at }}
              </span>
              <span>
                {{ t('global.page.updatedAt') }}: {{ enrollment.updated_at }}
              </span>
            </div>
          </li>
        </ul>
      </div>
    </UCard>
    <!-- Intervention Enrollment Card -->
    <UCard class="mb-4">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-2xl font-bold">
            {{ t('beneficiary.profile.interventionEnrollment.sectionLabel') }}
          </span>
          <UButton
            icon="i-lucide-plus"
            size="md"
          >
            {{ t('beneficiary.actions.add') }}
          </UButton>
        </div>
      </template>
      <span v-if="data?.data && data.data.intervention_enrollment.length === 0">
        {{ t('global.data.empty') }}
      </span>
      <div
        v-for="(enrollment) in data!.data.intervention_enrollment"
        v-else
        :key="enrollment.id"
      >
        <span> {{ enrollment.intervention_id }}</span>
      </div>
    </UCard>
    <!-- Beneficiary Relationships -->
    <UCard class="mb-4">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-2xl font-bold">
            {{ t('beneficiary.profile.relationships.sectionLabel') }}
          </span>
          <UButton
            size="md"
            icon="i-lucide-plus"
          >
            {{ t('beneficiary.actions.add') }}
          </UButton>
        </div>
      </template>
      <span v-if="data?.data && data?.data.beneficiary_relationships.length === 0">
        {{ t('global.data.empty') }}
      </span>
      <div
        v-for="(relationship) in data!.data.beneficiary_relationships"
        v-else
        :key="relationship.id"
      >
        {{ relationship.relationship_type }}
      </div>
    </UCard>
    <!-- Emergency Contacts -->
    <UCard class="mb-4">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-2xl font-bold">
            {{ t('beneficiary.profile.emergency.sectionLabel') }}
          </span>
          <UButton
            size="md"
            icon="i-lucide-plus"
          >
            {{ t('beneficiary.actions.add') }}
          </UButton>
        </div>
      </template>
      <span v-if="data?.data && data?.data.emergency_contacts.length === 0">
        {{ t('global.data.empty') }}
      </span>
      <div
        v-for="(contact) in data!.data.emergency_contacts"
        v-else
        :key="contact.id"
      >
        {{ contact.relationship }}
      </div>
    </UCard>
    <!-- Data Dump -->
    <!-- <UCard class="mb-4">
      <template #header>
        Raw Data
      </template>
      <pre>{{ JSON.stringify(data, null, '\t') }}</pre>
    </UCard> -->
    <!-- End of Cards -->
  </NuxtLayout>
</template>
