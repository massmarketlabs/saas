<i18n src="../i18n.json"></i18n>

<script setup lang="ts">
import type { interventions, program_enrollment, programs, terms } from '~~/server/database/schema'
import { Placeholder } from '#components'

interface Program {
  rootTable: string
  data: typeof programs.$inferSelect &
    { terms: typeof terms.$inferSelect[] } &
    { interventions: typeof interventions.$inferSelect[] } &
    { program_enrollment: typeof program_enrollment.$inferSelect[] }
}

definePageMeta({
  layout: false
})

const localePath = useLocalePath()

const { t } = useI18n()

const route = useRoute()

const id = route.params.id

const { data } = await useFetch<Program>('/api/admin/aggregate/programs', { query: { id } })

useHead({ title: `Programs | ${data.value?.data?.name}` })
</script>

<template>
  <NuxtLayout name="admin">
    <template #navRight>
      <UButton
        :to="localePath('/admin/programs')"
        variant="outline"
        color="neutral"
        icon="i-lucide-arrow-left"
      >
        {{ t('global.page.back') }}
      </UButton>
    </template>
    <!-- Interventions -->
    <UCard class="mb-4">
      <template #header>
        <div class="flex justify-between">
          <span class="font-bold text-2xl">Interventions</span>
          <UModal
            title="Add an Intervention"
            description="Consectetur non sit labore nostrud consequat dolor aliquip ad consequat duis."
          >
            <UButton
              size="md"
              icon="i-lucide-plus"
              :label="t('global.page.create')"
            />

            <template #body>
              <Placeholder class="h-48" />
            </template>
          </UModal>
        </div>
      </template>
      <span v-if="!data?.data.interventions || data?.data.interventions.length === 0">
        No data available
      </span>
      <div
        v-for="(interventionItem) in data?.data.interventions"
        v-else
        :key="interventionItem.id"
      >
        <UButton
          variant="link"
          :to="localePath(`/admin/programs/${id}/intervention/${interventionItem.id}`)"
        >
          <span>
            {{ interventionItem.name }}
          </span>
        </UButton>
      </div>
    </UCard>
    <!-- Terms -->
    <UCard class="mb-4">
      <template #header>
        <div class="flex justify-between">
          <span class="text-2xl font-bold">Terms</span>
          <UModal
            title="Create a Term"
            description="Eiusmod incididunt deserunt excepteur minim ex eiusmod adipisicing fugiat sunt ut excepteur."
          >
            <UButton
              size="md"
              icon="i-lucide-plus"
              :label="t('global.page.create')"
            />

            <template #body>
              <Placeholder class="h-48" />
            </template>
          </UModal>
        </div>
      </template>
      <span v-if="!data?.data.terms || data?.data.terms.length === 0">
        No data available
      </span>
      <UButton
        v-for="(termItem) in data?.data.terms"
        v-else
        :key="termItem.id"
        :to="localePath(`/admin/programs/${id}/term/${termItem.id}`)"
        variant="link"
      >
        <span>
          {{ termItem.name }}
        </span>
      </UButton>
    </UCard>
    <!-- Program Enrollment -->
    <UCard class="mb-4">
      <template #header>
        <div class="flex justify-between">
          <span class="text-2xl font-bold">Program Enrollment</span>
          <UModal
            title="Create a Program Enrollment"
            description="Lorem officia esse eu labore nulla."
          >
            <UButton
              size="md"
              icon="i-lucide-plus"
              :label="t('global.page.create')"
            />
            <template #body>
              <Placeholder class="h-48" />
            </template>
          </UModal>
        </div>
      </template>
      <span v-if="!data?.data.program_enrollment || data?.data.program_enrollment.length === 0">
        No data available
      </span>
      <div
        v-for="(programEnrollmentItem) in data?.data.program_enrollment"
        v-else
        :key="programEnrollmentItem.id"
      >
        <span>
          Beneficiary ID: {{ programEnrollmentItem.beneficiary_id }}
        </span>
      </div>
    </UCard>
    <!-- Raw Data -->
    <!-- <UCard>
      <template #header>
        <span>Raw Data</span>
      </template>
      <pre> {{ data }} </pre>
    </UCard> -->
  </NuxtLayout>
</template>
