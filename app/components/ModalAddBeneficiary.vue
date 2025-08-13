<script setup lang="ts">
const { t } = useI18n()
const { data } = await useFetch('/api/admin/user/list')
</script>

<template>
  <UModal
    title="Add Beneficiary"
    description="Add a new beneficiary to this intervention"
  >
    <UButton
      size="sm"
      icon="i-lucide-user-plus"
      :label="t('global.page.create')"
      color="primary"
    />
    <template
      v-if="data?.data"
      #body
    >
      <div
        v-for="user in data?.data"
        :key="user.id"
      >
        {{ user }}
      </div>
      <!-- <Placeholder class="h-64" /> -->
    </template>
  </UModal>
</template>
