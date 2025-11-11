<script setup lang="ts">
import { generateContentMenu } from '~/layouts/menu-lms-content'

definePageMeta({
  layout: false
})

const route = useRoute()
const id = route.params.id
const { data } = await useFetch(`/api/lms/intervention/${id as ':id'}`, { method: 'post', key: `lms-intervention-${id}` })
const menu = computed(() => generateContentMenu(data))
</script>

<template>
  <NuxtLayout name="lms-content">
    <template #navigation>
      <ContentNavigation :menu="menu" />
    </template>
    <UCard>
      <UCalendar variant="solid" />
    </UCard>
  </NuxtLayout>
</template>
