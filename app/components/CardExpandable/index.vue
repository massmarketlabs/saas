<script setup lang="ts">
import { computed, ref } from 'vue'

// Types
interface CardExpandableProps<T = Record<string, any>> {
  // Required props
  title: string
  items: T[]

  // Optional customization props
  headerIcon?: string
  emptyStateIcon?: string
  emptyStateTitle?: string
  emptyStateDescription?: string
  itemsPerPage?: number
  itemKeyPath?: string
}

interface CardExpandableSlots<T = Record<string, any>> {
  'header-actions': () => any
  'empty-action': () => any
  'item': (props: { item: T, index: number }) => any
}

// Define generic props with defaults
const props = withDefaults(defineProps<CardExpandableProps>(), {
  headerIcon: 'i-lucide-list',
  emptyStateIcon: 'i-lucide-inbox',
  emptyStateTitle: 'No items yet',
  emptyStateDescription: 'Get started by adding your first item.',
  itemsPerPage: 5,
  itemKeyPath: 'id'
})

// Define slots for better type checking
defineSlots<CardExpandableSlots>()

// Reactive state
const isExpanded = ref<boolean>(false)

// Computed properties
const displayedItems = computed(() => {
  if (!props.items || props.items.length <= props.itemsPerPage) {
    return props.items
  }

  return isExpanded.value ? props.items : props.items.slice(0, props.itemsPerPage)
})

// Methods
const toggleExpanded = (): void => {
  isExpanded.value = !isExpanded.value
}

const getItemKey = (item: Record<string, any>, index: number): string | number => {
  // Try to get key from item using the specified path
  const keys = props.itemKeyPath.split('.')
  let value: any = item

  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key]
    } else {
      // Fallback to index if key path doesn't exist
      return index
    }
  }

  return value || index
}
</script>

<template>
  <UCard class="shadow-sm">
    <template #header>
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-center gap-2">
          <Icon
            :name="headerIcon"
            class="w-5 h-5 text-primary"
          />
          <span class="font-bold text-xl">{{ title }}</span>
        </div>
        <div class="flex flex-wrap gap-2">
          <slot name="header-actions" />
        </div>
      </div>
    </template>

    <!-- Empty state -->
    <div
      v-if="!items || items.length === 0"
      class="text-center py-12"
    >
      <Icon
        class="w-12 h-12 text-primary mx-auto mb-4"
        :name="emptyStateIcon"
      />
      <h3 class="text-lg font-medium mb-2">
        {{ emptyStateTitle }}
      </h3>
      <p class="text-gray-500 mb-4">
        {{ emptyStateDescription }}
      </p>
      <slot name="empty-action" />
    </div>

    <!-- Items list -->
    <div
      v-else
      class="space-y-3"
    >
      <div
        v-for="(item, index) in displayedItems"
        :key="getItemKey(item, index)"
        class="bg-accented rounded-lg p-4"
      >
        <slot
          name="item"
          :item="item"
          :index="index"
        />
      </div>
    </div>

    <!-- Footer with show more/less button -->
    <template
      v-if="items && items.length > itemsPerPage"
      #footer
    >
      <div class="flex justify-center">
        <UButton
          :icon="isExpanded ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
          :label="isExpanded ? 'Show Less' : `Show ${items.length - itemsPerPage} More`"
          variant="ghost"
          size="sm"
          @click="toggleExpanded"
        />
      </div>
    </template>
  </UCard>
</template>
