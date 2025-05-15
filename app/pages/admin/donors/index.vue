<i18n src="./i18n.json"></i18n>

<script lang="ts" setup>
import type { aggregate_donor_contributions } from '~~/server/database/schema'

type Donor = typeof aggregate_donor_contributions.$inferSelect

const { t } = useI18n()

const isUserModalOpen = ref(false)

const fetchData: FetchDataFn<Donor> = async ({ page, limit, sort, filter }) => {
  const result = await $fetch<PageData<Donor>>('/api/admin/list/aggregate_donor_contributions', {
    query: {
      page,
      limit,
      sort: JSON.stringify(sort.map(item => [item.field, item.order])),
      filter: JSON.stringify(filter)
    }
  })

  return {
    data: result.data,
    total: result.total
  }
}

const columns: AdminTableColumn<typeof aggregate_donor_contributions.$inferSelect>[] = [
  { accessorFn: row => row.donor_id, header: 'ID' },
  { accessorFn: row => row.donor_name, header: 'Name' },
  { accessorFn: row => row.donor_created_at, header: 'Created At' }
]
</script>

<template>
  <NuxtLayout name="admin">
    <template #navRight>
      <UButton
        color="neutral"
        icon="i-lucide-plus"
        variant="outline"
        @click="isUserModalOpen = true"
      >
        {{ t('donors.actions.createDonor') }}
      </UButton>
    </template>
    <div>
      <AdminTable
        ref="donors-table"
        :columns="columns"
        :fetch-data="fetchData"
      />
    </div>
  </NuxtLayout>
</template>
