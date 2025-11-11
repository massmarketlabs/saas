<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { InternalApi } from 'nitropack'

definePageMeta({
  layout: 'lms'
})

const route = useRoute()
const id = route.params.id

const { data } = await useFetch(`/api/lms/intervention/${id}/classlist`, { method: 'post' })

const columns: TableColumn<InternalApi['/api/lms/intervention/:id/classlist']['post'][number]>[] = [
  { accessorFn: row => row.id, header: 'ID' },
  { accessorFn: row => row.user.name, header: 'Name' },
  { accessorFn: row => row.user.role, header: 'Role' },
  {
    accessorFn: row => row.created_at,
    header: 'Enrolled at',
    cell: el => new Date(el.getValue() as string).toLocaleString()
  }
]
</script>

<template>
  <UContainer class="space-y-4">
    <h3 class="text-lg font-semibold">
      Class list
    </h3>
    <UTable
      :columns="columns"
      :data="data"
      sticky
    />
  </UContainer>
</template>
