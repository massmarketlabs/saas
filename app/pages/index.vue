<!-- app/pages/index.vue -->
<i18n src="./i18n.json"></i18n>

<script setup lang="ts">
definePageMeta({
  layout: false
})
</script>

<template>
  <NuxtLayout name="lms">
    <UContainer class="space-y-6">
      <LandingHeader class="mt-6" />
      <GridTwoColumn>
        <template #left>
          <LandingInterventionEnrollment />
          <LandingRecentActivity />
        </template>
        <template #right>
          <LandingTasks />
        </template>
      </GridTwoColumn>
    </UContainer>
  </NuxtLayout>
</template>
