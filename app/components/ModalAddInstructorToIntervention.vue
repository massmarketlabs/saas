<script setup lang="ts">
import { refDebounced } from '@vueuse/core'

interface ModelAddInstructorsToInterventionProps {
  enlistedInstructors: string[]
}

const props = defineProps<ModelAddInstructorsToInterventionProps>()
const emits = defineEmits(['instructorEnrollmentChange'])
const DEFAULT_LIMIT = 50
const isOpen = ref(false)
const name = ref('')
const page = ref(1)

const debouncedName = refDebounced(name, 1000) // 1000ms debounce delay

const toast = useToast()
const { t } = useI18n()
const route = useRoute()

const { intervention_id } = route.params

const roleFilter: FilterCondition = { col: 'role', op: 'comma-separated', v: 'instructor' }

const filters = computed(() => {
  const baseFilters: FilterCondition[] = [roleFilter]
  if (debouncedName.value.trim()) {
    baseFilters.push({ col: 'name', op: 'like', v: debouncedName.value })
  }
  return baseFilters
})

const { data, pending, refresh: __refresh } = await useFetch('/api/admin/user/list', {
  query: computed(() => ({
    filter: JSON.stringify(filters.value),
    page: page.value,
    limit: DEFAULT_LIMIT
  })),
  key: `users-instructors-${page.value}`
})

// Track all loaded users across pages
const allUsers = ref <NonNullable<typeof data.value>['data']> ([])
const hasMorePages = computed(() => {
  if (!data.value) {
    return false
  }
  return data.value.total != allUsers.value.length
})

// Watch for data changes and accumulate results
watch(data, (newData) => {
  if (newData?.data) {
    if (page.value === 1) {
      // Reset for new search or first load
      allUsers.value = [...newData.data]
    } else {
      // Append new results for load more
      allUsers.value = [...allUsers.value, ...newData.data]
    }
  }
}, { immediate: true })

// Reset pagination when search changes
watch(debouncedName, () => {
  page.value = 1
  allUsers.value = []
})

const loadMore = async () => {
  page.value += 1
  // The watcher will handle appending the new data
}

const handleUpdateInstructors = async (enroll: boolean | string, user_id: string) => {
  if (typeof enroll === 'string') {
    return
  }
  const t = toast.add({ title: 'Updating...', description: 'Making changes to data, please wait...' })
  const resp = await $fetch('/api/admin/intervention/enroll', { method: 'post', body: {
    user_id,
    intervention_id
  } })

  if (!resp.success) {
    toast.update(t.id, { color: 'error', title: resp.message, description: '' })
    return
  }
  toast.update(t.id, { color: 'success', title: resp.message, description: '' })
}
</script>

<template>
  <UModal
    v-model:open="isOpen"
    title="Add Instructors"
    description="Add a new instructor to this intervention"
    @after:leave="emits('instructorEnrollmentChange')"
  >
    <UButton
      size="sm"
      icon="i-lucide-user-plus"
      :label="t('global.page.add')"
      color="primary"
    />

    <template #body>
      <div class="space-y-3">
        <UInput
          v-model="name"
          :loading="pending"
          class="w-full"
          icon="i-lucide-search"
          placeholder="Search"
        />

        <div v-if="!allUsers || allUsers.length === 0">
          <span class="text-gray-500 font-medium text-center block">
            {{ pending ? 'Loading...' : 'No data found' }}
          </span>
        </div>

        <div
          v-else
          class="space-y-2"
        >
          <div
            v-for="(user) in allUsers"
            :key="user.id"
          >
            <UCheckbox
              color="primary"
              variant="card"
              :default-value="props.enlistedInstructors.includes(user.id)"
              :label="`${user.name}`"
              @update:model-value="(val) => handleUpdateInstructors(val, user.id)"
            />
          </div>

          <UButton
            v-if="hasMorePages"
            class="w-full justify-center"
            icon="i-lucide-plus"
            variant="outline"
            :loading="pending"
            :disabled="pending"
            @click="loadMore"
          >
            {{ pending ? 'Loading...' : 'Load More' }}
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>
