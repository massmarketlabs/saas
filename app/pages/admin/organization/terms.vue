<script setup lang="ts">
import type { UModal } from '#components'
import type { RequestInsertTerm } from '~~/server/internal/intervention/zod-types'
import { insertTerm } from '~~/server/internal/intervention/zod-types'

definePageMeta({ layout: false })
const toast = useToast()
const form = useTemplateRef('insert-term-form')
const table = useAdminTable('terms-table')
const columns = [{ accessorKey: 'id', header: 'ID' }, { accessorKey: 'name', header: 'Name' }, { accessorKey: 'start_date', header: 'Start Date' }, { accessorKey: 'end_date', header: 'End Date' }]
const requestFetch = useRequestFetch()
const isLoading = ref(false)
const fetchData = async () => {
  return await requestFetch('/api/admin/list/terms')
}
const state = reactive<Partial<RequestInsertTerm>>({})
const onSubmit = async (payload: FormSubmitEvent<RequestInsertTerm>) => {
  await $fetch('/api/admin/terms', {
    method: 'post',
    body: payload.data,
    onRequest: () => {
      isLoading.value = true
    },
    onResponseError: ({ error }) => {
      toast.add({ title: error?.message, description: 'An error has occurred' })
      isLoading.value = false
    },
    onResponse: ({ response }) => {
      if (response.ok) {
        toast.add({ color: 'success', title: 'Term Added' })
        // Clear the form
        Object.keys(state).forEach((key) => {
          delete state[key as keyof typeof state]
        })
        table.refresh()
      }
      isLoading.value = false
    }
  })
}
</script>

<template>
  <NuxtLayout name="admin">
    <AdminTable
      ref="terms-table"
      :columns="columns"
      :fetch-data="fetchData"
    >
      <template #top-right>
        <UModal
          title="Insert a new term"
          description="Managing different terms has never been easier"
        >
          <UButton
            icon="i-lucide-plus"
            :loading="isLoading"
          >
            Add
          </UButton>
          <template #body>
            <UForm
              ref="insert-term-form"
              :state="state"
              :schema="insertTerm"
              class="space-y-6"
              :loading-auto="isLoading"
              @submit="onSubmit"
            >
              <UFormField
                name="name"
                label="Name"
              >
                <UInput
                  v-model="state.name"
                  placeholder="Name"
                  class="w-full"
                />
              </UFormField>
              <UFormField
                name="start_date"
                label="Start Date"
              >
                <UInput
                  v-model="state.start_date"
                  type="datetime-local"
                  class="w-full"
                />
              </UFormField>
              <UFormField
                name="end_date"
                label="End Date"
              >
                <UInput
                  v-model="state.end_date"
                  type="datetime-local"
                  class="w-full"
                />
              </UFormField>
            </UForm>
          </template>
          <template #footer>
            <UButton
              type="submit"
              :loading="isLoading"
              @click="form?.submit"
            >
              Submit
            </UButton>
          </template>
        </UModal>
      </template>
    </AdminTable>
  </NuxtLayout>
</template>
