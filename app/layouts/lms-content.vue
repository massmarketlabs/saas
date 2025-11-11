<!-- app/layout/lms-content.vue -->
<script setup lang="ts">
defineSlots<{ navigation: () => any, default: () => any }>()
</script>

<template>
  <NuxtLayout name="lms">
    <UContainer class="grid grid-cols-12 gap-4 min-h-0 flex-1">
      <div class="col-span-3 flex gap-2">
        <div class="flex-1 w-full">
          <slot name="navigation" />
        </div>
      </div>
      <div class="col-span-9">
        <slot />
      </div>
    </UContainer>
  </NuxtLayout>
</template>
