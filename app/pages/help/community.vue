<script lang="ts" setup>
definePageMeta({
  layout: false

})

const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <NuxtLayout name="default">
    <template #nav-right>
      <SiteNavigation
        :t="t"
        :locale-path="localePath"
      />
    </template>
    <span>Hello, community</span>
  </NuxtLayout>
</template>
