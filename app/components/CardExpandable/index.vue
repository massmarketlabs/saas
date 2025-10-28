<!-- app/components/CardExpandable/index.vue -->
<script setup lang="ts" generic="T">
import { computed, ref } from 'vue'

// Types
interface CardExpandableProps<T> {
  title: string
  items?: T[]
  headerIcon?: string
  emptyStateIcon?: string
  emptyStateTitle?: string
  emptyStateDescription?: string
  itemsPerPage?: number
  itemKeyPath?: string
}

interface CardExpandableSlots<T> {
  'header-actions': () => any
  'empty-action': () => any
  'item': (props: { item: T, index: number }) => any
}

const props = withDefaults(defineProps<CardExpandableProps<T>>(), {
  headerIcon: 'i-lucide-list',
  emptyStateIcon: 'i-lucide-inbox',
  emptyStateTitle: 'No items yet',
  emptyStateDescription: 'Get started by adding your first item.',
  itemsPerPage: 5,
  itemKeyPath: 'id'
})

defineSlots<CardExpandableSlots<T>>()

// Reactive state
const isExpanded = ref<boolean>(false)

// Computed properties with better null safety
const safeItems = computed(() => {
  return Array.isArray(props.items) ? props.items : []
})

const displayedItems = computed(() => {
  const items = safeItems.value
  if (items.length <= props.itemsPerPage) {
    return items
  }
  return isExpanded.value ? items : items.slice(0, props.itemsPerPage)
})

const hasMoreItems = computed(() => {
  return safeItems.value.length > props.itemsPerPage
})

// Methods
const toggleExpanded = (): void => {
  isExpanded.value = !isExpanded.value
}

const getItemKey = (item: T, index: number): string | number => {
  if (!item)
    return index

  try {
    const keys = props.itemKeyPath.split('.')
    let value: any = item

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key]
      } else {
        return index
      }
    }

    return value || index
  } catch {
    return index
  }
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

    <!-- Content -->
    <div
      v-if="safeItems.length === 0"
      class="text-center py-12"
    >
      <!-- Empty state -->
      <UIcon
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

    <div
      v-else
      class="space-y-3"
    >
      <!-- Items list -->
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
      v-if="hasMoreItems"
      #footer
    >
      <div class="flex justify-center">
        <UButton
          :icon="isExpanded ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
          :label="isExpanded ? 'Show Less' : `Show ${safeItems.length - itemsPerPage} More`"
          variant="ghost"
          size="sm"
          @click="toggleExpanded"
        />
      </div>
    </template>
  </UCard>
</template>
