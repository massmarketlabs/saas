<script setup lang="ts">
import type { RequestInsertRelationship } from '~~/server/database'
import type * as schema from '~~/server/database/schema'
import { get, refDebounced, set } from '@vueuse/core'

type User = typeof schema.user.$inferSelect

const props = defineProps<{ userId: string }>()
const emits = defineEmits(['familyMemberCreated'])

// Search and filtering
const searchInput = ref('')
const debouncedSearchInput = refDebounced(searchInput, 1000)

const computedFilter = computed<FilterCondition[]>(() => {
  const searchTerm = get(debouncedSearchInput).trim()
  if (!searchTerm)
    return []
  return [{ col: 'name', op: 'like', v: searchTerm }]
})

const toast = useToast()
// Reactive fetching - this will re-run when computedFilter changes
const { data: users, pending, error } = await useFetch('/api/admin/user/list', {
  query: computed(() => ({
    filter: JSON.stringify(get(computedFilter))
  }))
})

// User selection
const selectedUsers = ref<User[]>([])
const userRoles = ref<Record<string, string>>({})

// Role options
const roleOptions = [
  { label: 'Parent', value: 'parent' },
  { label: 'Child', value: 'child' },
  { label: 'Sibling', value: 'sibling' },
  { label: 'Other', value: 'other' }
]

const allRolesAssigned = computed(() => {
  const selected = get(selectedUsers)
  const roles = get(userRoles)

  return selected.every(s => roles[s.id] && roles[s.id] !== '')
})

const steps = [
  {
    title: 'Select User',
    description: 'Who are we adding?',
    icon: 'i-lucide-users',
    slot: 'users' as const
  },
  {
    title: 'Roles',
    description: 'Now, let\'s figure out who\'s who',
    icon: 'oui:app-users-roles',
    slot: 'roles' as const
  }
]

const stepper = useTemplateRef('stepper')

const handleSubmit = async () => {
  const payload: RequestInsertRelationship = []

  for (const user of get(selectedUsers)) {
    const role = get(userRoles)[user.id]
    if (!role) {
      continue
    }

    payload.push({ related_user_id: user.id, user_id: props.userId, relationship_type: role })
  }

  console.log('submit', payload)

  const resp = await $fetch('/api/admin/user/relationships', { method: 'post', body: payload })
  if (resp.success) {
    toast.add({ color: 'success', title: 'Updated relationships' })
    emits('familyMemberCreated')
  }
}

const handleUpdateSelectedUser = (user: User) => {
  const currentSelected = get(selectedUsers)
  const isSelected = currentSelected.some(selectedUser => selectedUser.id === user.id)

  if (isSelected) {
    // Remove user and their role
    const newData = currentSelected.filter(x => x.id !== user.id)
    set(selectedUsers, newData)

    // Also remove from userRoles
    const currentRoles = get(userRoles)
    const { [user.id]: removedRole, ...remainingRoles } = currentRoles
    set(userRoles, remainingRoles)
    return
  }

  // Add user
  set(selectedUsers, [...currentSelected, user])
}

const handleRemoveSelectedUser = (userId: string) => {
  const newUsers = get(selectedUsers).filter(x => x.id !== userId)
  set(selectedUsers, newUsers)

  // Remove the user's role from userRoles
  const currentRoles = get(userRoles)
  const { [userId]: removedRole, ...remainingRoles } = currentRoles
  set(userRoles, remainingRoles)

  if (newUsers.length === 0 && stepper.value?.hasPrev) {
    stepper.value?.prev()
  }
}
</script>

<template>
  <UModal
    title="Family Members"
    description="Easily keep track of family members that are part of the organization"
  >
    <UButton
      icon="i-heroicons-plus"
      label="Add Family Member"
      size="sm"
      variant="outline"
    />
    <template #body>
      <UStepper
        ref="stepper"
        :items="steps"
      >
        <template #users>
          <div class="space-y-6">
            <UInput
              v-model="searchInput"
              placeholder="Search users..."
              class="w-full"
              icon="i-lucide-search"
            />

            <div
              v-if="pending"
              class="flex justify-center py-8"
            >
              <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500" />
            </div>

            <div
              v-else-if="error"
              class="text-red-500 text-center py-4"
            >
              Error loading users: {{ error.message }}
            </div>

            <div
              v-else-if="users?.data?.length"
              class="space-y-3"
            >
              <UCheckbox
                v-for="user in users?.data"
                :key="user.id"
                :value="user.id"
                :label="user.name"
                :description="user.email"
                class="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                :default-value="get(selectedUsers).map(x => x.id).includes(user.id)"
                @change="() => handleUpdateSelectedUser(user as unknown as User)"
              />
            </div>

            <div
              v-else
              class="text-gray-500 text-center py-8"
            >
              {{ searchInput.trim() ? 'No users found' : 'Start typing to search for users' }}
            </div>
          </div>
        </template>

        <template #roles>
          <div class="space-y-4">
            <h3 class="text-lg font-semibold">
              Selected Users ({{ selectedUsers.length }})
            </h3>
            <div
              v-if="selectedUsers.length"
              class="space-y-2"
            >
              <div
                v-for="user in selectedUsers"
                :key="user.id"
                class="flex items-center justify-between p-3 bg-accented dark:bg-accented-800 rounded-lg"
              >
                <div class="flex gap-2 items-center">
                  <UButton
                    icon="i-lucide-x"
                    size="xs"
                    variant="outline"
                    color="error"
                    @click="handleRemoveSelectedUser(user.id)"
                  />
                  <span class="font-medium">{{ user.name }}</span>
                </div>
                <USelect
                  v-model="userRoles[user.id]"
                  :items="roleOptions"
                  placeholder="Select role..."
                  class="w-48"
                />
              </div>
            </div>
            <div
              v-else
              class="text-gray-500 text-center py-8"
            >
              No users selected. Go back to select users.
            </div>
          </div>
        </template>
      </UStepper>
    </template>

    <template #footer>
      <div class="w-full flex gap-2 justify-between mt-4">
        <UButton
          leading-icon="i-lucide-arrow-left"
          :disabled="!stepper?.hasPrev"
          label="Prev"
          @click="stepper?.prev()"
        />
        <UButton
          v-if="stepper?.hasNext"
          trailing-icon="i-lucide-arrow-right"
          label="Next"
          :disabled="selectedUsers.length === 0"
          @click="stepper?.next()"
        />
        <UButton
          v-else
          label="Submit"
          variant="outline"
          :disabled="selectedUsers.length === 0 || !allRolesAssigned"
          @click="handleSubmit"
        />
      </div>
    </template>
  </UModal>
</template>
