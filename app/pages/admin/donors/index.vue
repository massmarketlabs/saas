<i18n src="./i18n.json"></i18n>

<script lang="ts" setup>
import type { donors } from '~~/server/database/schema'

type Donor = typeof donors.$inferSelect

const { t } = useI18n()

const isDonorModalOpen = ref(false)

const fetchData: FetchDataFn<Donor> = async ({ page, limit, sort, filter }) => {
  const result = await $fetch<PageData<Donor>>('/api/admin/list/donors', {
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

const columns: AdminTableColumn<Donor>[] = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'created_at', header: 'Created At' }
]

const filters: AdminTableFilter[] = reactive([
  {
    name: t('global.page.name'),
    field: 'name',
    type: 'input',
    value: undefined
  },
  {
    name: t('global.page.createdAt'),
    field: 'created_at',
    type: 'daterange',
    value: { start: undefined, end: undefined }
  }
])
</script>

<template>
  <NuxtLayout name="admin">
    <template #navRight>
      <UButton
        color="neutral"
        icon="i-lucide-plus"
        variant="outline"
        @click="isDonorModalOpen = true"
      >
        {{ t('donors.actions.createDonor') }}
      </UButton>
    </template>
    <AdminTable
      ref="table"
      :columns="columns"
      :filters="filters"
      :fetch-data="fetchData"
    />
  </NuxtLayout>
</template>
