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

const { activeOrganization, sessionFetching } = useAuth()
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
        :to="localePath(`/${sessionFetching ? '' : activeOrganization?.slug}/admin/programs`)"
        variant="outline"
        color="neutral"
        icon="i-lucide-arrow-left"
        :label="t('global.page.back')"
      />
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
          :to="localePath(`/${activeOrganization?.slug}/admin/programs/${id}/intervention/${interventionItem.id}`)"
        >
          <span>
            {{ interventionItem.name }}
          </span>
        </UButton>
      </div>
    </UCard>
  </NuxtLayout>
</template>
