<script lang="ts" setup>
const { menu } = defineProps<{ menu: NavigationMenuItem[][] }>()
</script>

<template>
  <div class="flex gap-6">
    <UNavigationMenu
      :items="menu"
      orientation="vertical"
      class="w-full"
    />
    <USeparator orientation="vertical" />
  </div>
</template>
