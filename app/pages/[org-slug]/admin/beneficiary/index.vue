<i18n src="./i18n.json"></i18n>

<script lang="ts" setup>
import type { beneficiary } from '~~/server/database/schema'
import ModalCreate from './components/modal-create.vue'
import ModalDeleteConfirmation from './components/modal-delete-confirmation.vue'

definePageMeta({
  layout: false
})

type Beneficiary = typeof beneficiary.$inferSelect

const toDeleteBeneficiary = ref<null | Beneficiary>(null)

const { t } = useI18n()

const { activeOrganization } = useAuth()

const localePath = useLocalePath()

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

const getRowItems = (row: globalThis.Row<Beneficiary>) => {
  const beneficiary = row.original
  return [
    {
      type: 'label',
      label: t('global.page.actions')
    },
    {
      type: 'separator'
    },
    {
      label: t('beneficiary.actions.viewProfile'),
      icon: 'i-lucide-user',
      async onSelect() {
        await navigateTo(localePath(`/${activeOrganization.value?.slug}/admin/beneficiary/${beneficiary.id}`))
      }
    },
    {
      label: t('global.page.delete'),
      icon: 'i-lucide-trash',
      color: 'error',
      onSelect() {
        toDeleteBeneficiary.value = beneficiary
      }
    }
  ]
}

const columns: AdminTableColumn<Beneficiary>[] = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'first_name_en', header: 'First Name' },
  { accessorKey: 'middle_name_en', header: 'Middle Name' },
  { accessorKey: 'last_name_en', header: 'Last Name' },
  { accessorKey: 'created_at', header: 'Created At' },
  {
    id: 'actions',
    cell: ({ row }) => h(
      'div',
      { class: 'text-right' },
      h(
        UDropdownMenu as any,
        {
          content: {
            align: 'end'
          },
          items: getRowItems(row)
        },
        () => h(UButton, {
          icon: 'i-lucide-ellipsis-vertical',
          color: 'neutral',
          variant: 'ghost',
          class: 'ml-auto'
        })
      )
    )
  }
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

const { refresh } = useAdminTable()

const closeDeleteModal = () => {
  toDeleteBeneficiary.value = null
}
</script>

<template>
  <NuxtLayout name="admin">
    <template #navRight>
      <ModalCreate
        :t="t"
        @beneficiary-created="refresh"
      />
    </template>
    <ModalDeleteConfirmation
      :close-delete-modal="closeDeleteModal"
      :to-delete-beneficiary="toDeleteBeneficiary"
      :refresh="refresh"
    />
    <AdminTable
      ref="table"
      :columns="columns"
      :filters="filters"
      :fetch-data="fetchData"
    />
  </NuxtLayout>
</template>
