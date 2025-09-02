<i18n src="./i18n.json"></i18n>

<script setup lang="ts">
import type { SelectItem } from '@nuxt/ui'
import BanUserModal from './components/BanUserModal.vue'
import CreateUserModal from './components/CreateUserModal.vue'

definePageMeta({
  layout: false
})

const { t } = useI18n()
const { client } = useAuth()
const isUserModalOpen = ref(false)
const isBanModalOpen = ref(false)
const selectedUserId = ref('')

const filters: AdminTableFilter[] = reactive([
  {
    name: t('global.page.name'),
    field: 'name',
    type: 'input',
    value: undefined
  },
  {
    name: t('user.columns.role'),
    field: 'role',
    type: 'checkbox',
    items: [
      { label: t('user.roles.beneficiary'), id: 'beneficiary', count: 0 },
      { label: t('user.roles.admin'), id: 'admin', count: 0 },
      { label: t('user.roles.instructor'), id: 'instructor', count: 0 }
    ],
    value: []
  },
  {
    name: t('global.page.createdAt'),
    field: 'createdAt',
    type: 'daterange',
    value: { start: undefined, end: undefined }
  }
])

const fetchRoleCount = async (filter: FilterCondition[]) => {
  const statusCount = await $fetch<ColumnCount[]>('/api/admin/count/user/role', {
    query: {
      filter: JSON.stringify(filter)
    }
  })
  const roleFilter = filters[1] as FilterCheckbox
  roleFilter.items.forEach((item) => {
    const status = statusCount.find(status => status.column === item.id)
    item.count = status ? status.count : 0
  })
}

const fetchData: FetchDataFn<UserWithRole & { roles?: string[] }> = async ({ page, limit, sort, filter }) => {
  await fetchRoleCount(filter)
  const result = await $fetch<PageData<UserWithRole>>('/api/admin/user/list', {
    query: {
      page,
      limit,
      sort: JSON.stringify(sort.map((item) => {
        return [item.field, item.order]
      })),
      filter: JSON.stringify(filter)
    }
  })

  const transformed = result.data.map(d => ({
    ...d,
    roles: d.role?.split(',')
  }))
  return {
    data: transformed,
    total: result.total
  }
}

const { refresh } = useAdminTable()

const getActionItems = (row: Row<UserWithRole & { roles?: string[] }>) => {
  const user = row.original
  return [
    {
      type: 'label',
      label: t('global.page.actions')
    },
    {
      type: 'separator'
    },
    {
      label: t('global.page.view'),
      icon: 'i-lucide-eye',
      onSelect: async () => await navigateTo(`/admin/organization/user/${user.id}`)
    },
    {
      label: user.banned ? t('user.actions.unban') : t('user.actions.ban'),
      icon: 'i-lucide-ban',
      color: user.banned ? 'success' : 'error',
      async onSelect() {
        if (user.banned) {
          const result = await client.admin.unbanUser({
            userId: user.id
          })
          if (result.data?.user) {
            refresh()
          }
        } else {
          selectedUserId.value = user.id
          isBanModalOpen.value = true
        }
      }
    },
    {
      label: t('global.page.delete'),
      icon: 'i-lucide-trash',
      color: 'error',
      async onSelect() {
        const removeResult = await client.admin.removeUser({
          userId: user.id
        })
        if (removeResult.data?.success) {
          refresh()
        } else {
          console.error(removeResult.error)
        }
      }
    }
  ]
}

const getRoleDropdownItems = (original: UserWithRole & { roles?: string[] }): SelectItem[] => {
  const roles = ['beneficiary', 'admin', 'instructor'] as const
  return roles.map((role) => {
    return {
      label: t(`user.roles.${role}`),
      value: role,
      onSelect: async () => {
        const payload = original.roles
        if (!payload)
          return
        const index = payload.indexOf(role)

        if (index === -1) {
          payload.push(role)
        } else {
          payload.splice(index, 1)
        }

        console.log({ payload })

        const result = await client.admin.setRole({
          userId: original.id,
          role: payload.join(',') as typeof roles[number]
        })
        if (result.data?.user) {
          refresh()
        } else {
          console.error(result.error)
        }
      }
    }
  })
}

const columns: AdminTableColumn<UserWithRole & { roles?: string[] }>[] = [
  {
    accessorKey: 'id',
    header: 'ID'
  },
  {
    accessorKey: 'image',
    header: t('user.columns.avatar'),
    cell: avatarColumn
  },
  {
    accessorKey: 'name',
    header: t('global.page.name')
  },
  {
    accessorKey: 'email',
    header: t('user.columns.email')
  },
  {
    accessorKey: 'role',
    header: t('user.columns.role')
  },
  {
    accessorKey: 'status',
    header: t('global.page.status')
  },
  {
    accessorKey: 'createdAt',
    header: t('global.page.createdAt'),
    cell: dateColumn
  },
  {
    id: 'actions',
    cell: ({ row }) => actionColumn(row, getActionItems)
  }
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
        {{ t('user.actions.createUser') }}
      </UButton>
    </template>
    <AdminTable
      ref="table"
      :columns="columns"
      :filters="filters"
      :fetch-data="fetchData"
    >
      <template #role-cell="{ row: { original } }">
        <USelect
          v-model="original.roles"
          multiple
          :items="getRoleDropdownItems(original)"
          size="xs"
          class="w-full"
          arrow
        />
      </template>
      <template #status-cell="{ row: { original } }">
        <UBadge
          :color="original.banned
            ? 'error'
            : (original.emailVerified ? 'success' : 'warning')"
          :label="original.banned
            ? t('user.status.banned')
            : (original.emailVerified
              ? t('user.status.verified')
              : t('user.status.unverified'))"
        />
      </template>
    </AdminTable>
    <CreateUserModal
      v-model:open="isUserModalOpen"
      :t="t"
      @created="refresh"
    />
    <BanUserModal
      v-model:open="isBanModalOpen"
      :user-id="selectedUserId"
      :t="t"
      @banned="refresh"
    />
  </NuxtLayout>
</template>
