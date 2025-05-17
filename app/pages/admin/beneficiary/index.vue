<i18n src="./i18n.json"></i18n>

<script lang="ts" setup>
import type { beneficiary } from '~~/server/database/schema'

type Beneficiary = typeof beneficiary.$inferSelect

const { t } = useI18n()

const isDonorModalOpen = ref(false)

const fetchData: FetchDataFn<Beneficiary> = async ({ page, limit, sort, filter }) => {
  const result = await $fetch<PageData<Beneficiary>>('/api/admin/list/beneficiary', {
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

const columns: AdminTableColumn<Beneficiary>[] = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'first_name_en', header: 'First Name' },
  { accessorKey: 'middle_name_en', header: 'Middle Name' },
  { accessorKey: 'last_name_en', header: 'Last Name' },
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
        {{ t('beneficiary.actions.createBeneficiary') }}
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
