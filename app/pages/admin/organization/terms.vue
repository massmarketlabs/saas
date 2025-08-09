<script setup lang="ts">
definePageMeta({ layout: false })

const columns = [{ accessorKey: 'id', header: 'ID' }, { accessorKey: 'name', header: 'Name' }, { accessorKey: 'start_date', header: 'Start Date' }, { accessorKey: 'end_date', header: 'End Date' }]
const requestFetch = useRequestFetch()

const fetchData = async () => {
  return await requestFetch('/api/admin/list/terms')
}
</script>

<template>
  <NuxtLayout name="admin">
    <AdminTable
      :columns="columns"
      :fetch-data="fetchData"
    />
  </NuxtLayout>
</template>
