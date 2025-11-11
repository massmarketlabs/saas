<script lang="ts" setup>
import { generateContentMenu } from '~/layouts/menu-lms-content'

definePageMeta({
  layout: false
})

const route = useRoute()
const id = route.params.id as string
const subject_id = route.params.subject_id

const { data } = await useFetch(`/api/lms/intervention/${id as ':id'}`, { method: 'post', key: `lms-intervention-${id}` })
const menu = computed(() => generateContentMenu(data))
</script>

<template>
  <NuxtLayout name="lms-content">
    <template #navigation>
      <ContentNavigation :menu="menu" />
    </template>
    <pre> {{ subject_id }}</pre>
  </NuxtLayout>
</template>
