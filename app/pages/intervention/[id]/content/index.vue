<script setup lang="ts">
import { generateContentMenu } from '~/layouts/menu-lms-content'

const route = useRoute()
const id = route.params.id as string
const { data, refresh } = await useFetch(`/api/lms/intervention/${id as ':id'}`, { method: 'post', key: `lms-intervention-${id}` })
const menu = computed(() => generateContentMenu(data))

definePageMeta({ layout: false })
</script>

<template>
  <NuxtLayout name="lms-content">
    <template #navigation>
      <ContentNavigation :menu="menu" />
    </template>
    <template #default>
      <ContentSyllabus
        :id="id"
        :data="data"
        @update="refresh"
      />
    </template>
  </NuxtLayout>
</template>
