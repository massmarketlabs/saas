<i18n src="./i18n.json"></i18n>

<script lang="ts" setup>
import type { intervention } from '~~/server/database/schema'

type Intervention = typeof intervention.$inferSelect

const { t } = useI18n()

const isDonorModalOpen = ref(false)

const fetchData: FetchDataFn<Intervention> = async ({ page, limit, sort, filter }) => {
  const result = await $fetch<PageData<Intervention>>('/api/admin/list/intervention', {
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

const columns: AdminTableColumn<Intervention>[] = [
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
        {{ t('interventions.actions.createIntervention') }}
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
