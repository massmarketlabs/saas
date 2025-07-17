<i18n src="./i18n.json"></i18n>

<script lang="ts" setup>
import type { beneficiary } from '~~/server/database/schema'
import CreateModal from './components/create-modal.vue'

definePageMeta({
  layout: false
})

type Beneficiary = typeof beneficiary.$inferSelect

const tableKey = ref(0)
const deleteLoading = ref(false)

const toDeleteBeneficiary = ref<null | Beneficiary>(null)

const { t } = useI18n()

const toast = useToast()

const router = useRouter()

const org = useOrganizationStore()

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
        router.push(localePath(`/${org.myOrganization?.slug}/admin/beneficiary/${beneficiary.id}`))
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

function closeDeleteModal() {
  toDeleteBeneficiary.value = null
}

async function handleDelete() {
  try {
    deleteLoading.value = true
    const resp = await $fetch('/api/admin/beneficiary', { method: 'DELETE', body: { id: toDeleteBeneficiary.value?.id } })

    if (resp.length)
    {
      toast.add({ color: 'success', title: `Successfully deleted ${resp[0]?.id}` })
      closeDeleteModal()
      refresh()
    }
    // deleteLoading.value = false
  } catch (error) {
    console.error(error)
    // deleteLoading.value = false
  } finally {
    deleteLoading.value = false
  }
}
</script>

<template>
  <NuxtLayout name="admin">
    <template #navRight>
      <CreateModal
        :t="t"
        @beneficiary-created="refresh"
      />
    </template>
    <UModal
      :open="!!toDeleteBeneficiary"
      title="Are you sure?"
      :description="`Beneficiary: ${toDeleteBeneficiary?.first_name_en} ${toDeleteBeneficiary?.last_name_en}`"
      @update:open="closeDeleteModal"
    >
      <template #body>
        <span> This will be permanent and all data associated with this beneficiary will be lost for ever.</span>
      </template>
      <template #footer>
        <div class="flex gap-2">
          <UButton
            variant="outline"
            :disabled="deleteLoading"
            @click="closeDeleteModal"
          >
            Cancel
          </UButton>
          <UButton
            color="error"
            :disabled="deleteLoading"
            :loading="deleteLoading"
            @click="handleDelete"
          >
            Delete
          </UButton>
        </div>
      </template>
    </UModal>
    <AdminTable
      :key="tableKey"
      ref="table"
      :columns="columns"
      :filters="filters"
      :fetch-data="fetchData"
    />
  </NuxtLayout>
</template>
