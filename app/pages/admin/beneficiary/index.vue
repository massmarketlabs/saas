<i18n src="./i18n.json"></i18n>

<script lang="ts" setup>
import type { beneficiary } from '~~/server/database/schema'
// import { NuxtLink } from '#components'

type Beneficiary = typeof beneficiary.$inferSelect

const { t } = useI18n()

const router = useRouter()

const state = reactive({
  banReason: '',
  banExpiresIn: -1 as number | undefined
})

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
        router.push(`/admin/beneficiary/${beneficiary.id}`)
      }
    },
    {
      label: t('global.page.delete'),
      icon: 'i-lucide-trash',
      color: 'error',
      async onSelect() {
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

const schema = z.object({
  banReason: z.string().optional(),
  banExpiresIn: z.number().optional()
})

type Schema = zodOutput<typeof schema>

async function onSubmit({ data }: FormSubmitEvent<Schema>) {
  console.log({ data })
}
</script>

<template>
  <NuxtLayout name="admin">
    <template #navRight>
      <UModal
        :open="isDonorModalOpen"
        :close="{ onClick: () => { isDonorModalOpen = false } }"
        :title="t('user.modals.ban.title')"
      >
        <UButton
          color="neutral"
          icon="i-lucide-plus"
          variant="outline"
          @click="isDonorModalOpen = true"
        >
          {{ t('beneficiary.actions.createBeneficiary') }}
        </UButton>
        <template #body>
          <UForm
            class="space-y-4"
            :schema="schema"
            :state="state"
            @submit="onSubmit"
          >
            <UFormField
              :label="t('user.modals.ban.period')"
              name="banExpiresIn"
            >
              <USelect class="w-full" />
            </UFormField>
            <UFormField
              :label="t('user.modals.ban.reason')"
              name="banReason"
            >
              <UTextarea class="w-full" />
            </UFormField>

            <div class="flex justify-end gap-2">
              <UButton
                color="neutral"
                variant="outline"
                @click="isDonorModalOpen = false"
              >
                {{ t('global.page.cancel') }}
              </UButton>
              <UButton
                type="submit"
                color="error"
              >
                {{ t('user.modals.ban.submit') }}
              </UButton>
            </div>
          </UForm>
        </template>
      </UModal>
    </template>
    <AdminTable
      ref="table"
      :columns="columns"
      :filters="filters"
      :fetch-data="fetchData"
    />
  </NuxtLayout>
</template>
