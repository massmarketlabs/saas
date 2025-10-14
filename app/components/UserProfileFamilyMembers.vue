<script setup lang="ts">
import type { InternalApi } from 'nitropack'

const props = defineProps<{ id: string, data?: InternalApi['/api/admin/user/:id']['post'] }>()
const emits = defineEmits(['updateProfileSibling'])

const siblings = computed(() => {
  if (!props.data || !props.data?.relationship_user) {
    return []
  }

  return props.data.relationship_user.map(relationship => ({
    id: relationship.id,
    user_id: relationship.related_user_id,
    name: relationship.related_user.name,
    relationship: relationship.relationship_type,
    avatar: relationship.related_user.image,
    status: 'Active'
  }))
})
</script>

<template>
  <UCard class="shadow-lg border border-gray-200 rounded-xl overflow-hidden">
    <template #header>
      <div class="flex justify-between">
        <div class="flex items-center gap-3">
          <UIcon
            name="i-heroicons-users"
            class="text-green-600 text-xl"
          />
          <h2 class="text-lg font-semibold">
            Family Members
          </h2>
        </div>
        <ModalCreateFamilyMember
          :user-id="props.id"
          @family-member-created="emits('updateProfileSibling')"
        />
      </div>
    </template>
    <div
      v-if="siblings.length === 0"
      class="text-center my-6 space-y-2"
    >
      <Icon
        name="i-heroicons-users"
        class="text-green-600 text-xl rounded-full"
      />
      <p class="text-center text-xl font-bold text-gray-500">
        No current family members
      </p>
      <p class="text-center text-sm text-gray-500">
        Start by adding a family member
      </p>
    </div>
    <div
      v-else
      class="space-y-3"
    >
      <div
        v-for="sibling in siblings"
        :key="sibling.id"
        class="flex items-center gap-3 p-3 rounded-lg bg-accented"
      >
        <UAvatar
          :src="sibling.avatar || undefined"
          :alt="sibling.name"
        />
        <NuxtLink
          :to="`/admin/organization/user/${sibling.user_id}`"
          class="flex-1 space-y-1"
        >
          <p class="font-medium text-sm">
            {{ sibling.name }}
          </p>
          <p class="text-xs text-gray-500">
            {{ sibling.relationship }}
          </p>
          <UBadge
            :color="sibling.status === 'Active' ? 'success' : 'neutral'"
            variant="subtle"
            size="sm"
          >
            {{ sibling.status }}
          </UBadge>
        </NuxtLink>
      </div>
    </div>
  </UCard>
</template>
