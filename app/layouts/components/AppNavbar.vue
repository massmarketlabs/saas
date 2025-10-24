<script lang="ts" setup>
const localePath = useLocalePath()
</script>

<template>
  <!-- Navigation -->
  <nav
    class="fixed h-16 top-0 left-0 right-0 z-50 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border-b border-gray-200 dark:border-gray-800"
  >
    <UContainer class="flex h-full items-center justify-between">
      <NuxtLink :to="localePath('/')">
        <Logo class="w-16 h-16" />
      </NuxtLink>
      <slot name="center" />
      <slot name="right" />
    </UContainer>
  </nav>
</template>
