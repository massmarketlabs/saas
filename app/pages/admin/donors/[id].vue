<i18n src="./i18n.json"></i18n>

<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { contributions, donors } from '~~/server/database/schema'

interface DonorAggregate {
  rootTable: string
  data: typeof donors.$inferSelect & { contributions: typeof contributions.$inferSelect[] }
}
const route = useRoute()

const { t } = useI18n()

const localePath = useLocalePath()

const id = route.params.id

const { data, pending } = useFetch<DonorAggregate>('/api/admin/aggregate/donors', { query: { id } })

const columns: TableColumn<typeof contributions.$inferSelect>[] = [
  { accessorKey: 'amount', header: 'Amount' },
  { accessorKey: 'currency_code', header: 'Currency Code' },
  { accessorKey: 'created_at', header: 'Created At' }
]

useHead({
  title: `Donor | ${data.value?.data.name}`
})
</script>

<template>
  <NuxtLayout name="admin">
    <template #navRight>
      <UButton
        color="neutral"
        icon="i-lucide-arrow-left"
        variant="outline"
        :to="localePath('/admin/donors')"
        :label="t('global.page.back')"
      />
    </template>
    <div
      v-if="pending"
    >
      Loading...
    </div>

    <!-- Donor Info Card -->
    <UCard
      v-else
    >
      <div
        class="space-y-4"
      >
        <h2 class="text-2xl font-bold">
          {{ data?.data.name }}
        </h2>
        <p>
          ID: {{ data?.data.id }}
        </p>
        <p>
          Created: {{ formatDate(new Date(data?.data.created_at!)) }}
        </p>
        <p>
          Updated: {{ formatDate(new Date(data?.data.updated_at!)) }}
        </p>
      </div>
    </UCard>

    <!-- Contributions Table -->
    <UCard class="mt-4">
      <template #header>
        <h3 class="font-bold text-2xl">
          Contributions
        </h3>
      </template>
      <UTable
        :data="data?.data.contributions"
        :columns="columns"
        :loading="pending"
      >
        <template #created_at-cell>
          {{ formatDate(new Date(data?.data.created_at!)) }}
        </template>
      </UTable>
    </UCard>
  </NuxtLayout>
</template>
