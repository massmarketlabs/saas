<script setup lang="ts">
defineSlots<{ left: () => any, right: () => any }>()
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- Left Column: Interventions -->
    <div class="lg:col-span-2 space-y-6">
      <slot name="left" />
    </div>

    <!-- Right Column: Calendar and Tasks -->
    <div class="space-y-6">
      <slot name="right" />
    </div>
  </div>
</template>
