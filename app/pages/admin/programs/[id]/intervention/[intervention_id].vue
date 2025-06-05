<script setup lang="ts">
import type { evaluation, intervention_enrollment, interventions, programs, terms } from '~~/server/database/schema'

type DataKey = 'evaluation' | 'programs' | 'terms' | 'intervention_enrollment'

interface DataMap {
  evaluation: typeof evaluation.$inferSelect
  programs: typeof programs.$inferSelect
  terms: typeof terms.$inferSelect
  intervention_enrollment: typeof intervention_enrollment.$inferSelect
}

interface Intervention {
  rootTable: string
  data: typeof interventions.$inferSelect
    & DataMap
}

const route = useRoute()

const id = route.params.id // Program ID

const intervention_id = route.params.intervention_id

const localePath = useLocalePath()

const { data, pending } = await useFetch<Intervention>(`/api/admin/aggregate/interventions`, { query: { id: intervention_id } })

const find = <K extends DataKey>(key: K, id: string): DataMap[K] | undefined => {
  const array = data.value?.data[key]

  if (Array.isArray(array)) {
    return array.find((item): item is DataMap[K] => item.id === id)
  }

  return undefined
}

useHead({ title: `Intervention | ${data.value?.data.name}` })
</script>

<template>
  <NuxtLayout name="admin">
    <span v-if="pending">Loading...</span>
    <div
      v-else
      class="space-y-6"
    >
      <!-- Intervention Details -->
      <UCard>
        <template #header>
          <h3 class="text-2xl font-bold">
            Intervention Details
          </h3>
        </template>
        <dl class="grid grid-cols-2 space-y-4">
          <dt>
            ID
          </dt>
          <dd>
            <UButton
              variant="link"
              :to="localePath(`/admin/programs/${id}/intervention/${intervention_id}`)"
              :label="data?.data.id"
            />
          </dd>
          <dt>
            Name
          </dt>
          <dd>
            {{ data?.data.name }}
          </dd>
          <dt>
            Created At
          </dt>
          <dd>
            {{ formatDate(new Date(data?.data.created_at!)) }}
          </dd>
          <dt>
            Deleted At
          </dt>
          <dd>
            {{ data?.data.deleted_at }}
          </dd>
          <dt>
            Program
          </dt>
          <dd>
            {{ find('programs', data?.data.program_id!)?.name }}
          </dd>
          <dt>
            Term
          </dt>
          <dd>
            {{ find('terms', data?.data.term_id!)?.name }}
          </dd>
        </dl>
      </UCard>
      <!-- Evaluations -->
      <UCard>
        <template #header>
          <h3 class="text-2xl font-bold">
            Evaluations
          </h3>
        </template>
        <pre>{{ data?.data.evaluation }}</pre>
      </UCard>
      <!-- Intervention Enrollment -->
      <UCard>
        <template #header>
          <h3 class="text-2xl font-bold">
            Intervention Enrollment
          </h3>
        </template>
        <pre>{{ data?.data.intervention_enrollment }}</pre>
      </UCard>
      <!-- Terms -->
      <!-- <UCard>
        <template #header>
          <h3 class="text-2xl font-bold">
            Terms
          </h3>
        </template>
        <pre>{{ data?.data.terms }}</pre>
      </UCard> -->
      <!-- <pre>{{ data }}</pre> -->
    </div>
  </NuxtLayout>
</template>
