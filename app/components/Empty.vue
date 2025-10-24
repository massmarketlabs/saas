<script setup lang="ts">
const props = defineProps<{ icon: string, title: string, description?: string }>()
defineSlots<{ 'empty-action'?: () => any }>()
</script>

<template>
  <div class="space-y-6 text-center">
    <Icon
      class="w-12 h-12 text-primary mx-auto mb-4"
      :name="props.icon"
    />
    <h3 class="text-lg font-medium mb-2">
      {{ props.title }}
    </h3>
    <p
      v-if="props.description"
      class="text-gray-500 mb-4"
    >
      {{ props.description }}
    </p>
    <slot name="empty-action" />
  </div>
</template>
