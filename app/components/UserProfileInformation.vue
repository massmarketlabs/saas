<script setup lang="ts">
import type { InternalApi } from 'nitropack'
import BanUserModal from '../pages/admin/organization/user/components/BanUserModal.vue'

const props = defineProps<{
  id: string
  data: InternalApi['/api/admin/user/:id']['get'] | undefined
  t: TranFunction
}>()

const emits = defineEmits(['updateProfileInformation'])

const profileData = computed(() => ({
  studentId: props.data?.id,
  email: props.data?.email,
  name: props.data?.name,
  gender: props.data?.gender,
  avatar: props.data?.imageUrl,
  birthday: props.data?.dob,
  status: props.data?.banned ? 'Banned' : ('Active' as const),
  role: props.data?.role
}))

const isBanModalOpen = ref(false)

const { client } = useAuth()
const toast = useToast()
</script>

<template>
  <!-- Profile General Information -->
  <UCard class="shadow-lg border border-gray-200 rounded-xl overflow-hidden">
    <template #header>
      <div class="flex items-center gap-3">
        <UIcon
          name="i-heroicons-user-circle"
          class="text-blue-600 text-xl"
        />
        <h2 class="text-lg font-semibold">
          Profile Information
        </h2>
      </div>
    </template>

    <div class="space-y-6">
      <!-- Avatar Section -->
      <div class="flex flex-col items-center">
        <UAvatar
          :src="profileData.avatar ?? ''"
          :alt="profileData.name"
          size="3xl"
        />
        <h3 class="text-xl font-semibold mt-3">
          {{ profileData.name }}
        </h3>
        <UDropdownMenu
          :items="[
            {
              label: profileData.status === 'Active' ? 'Ban' : 'Unban',
              icon: 'i-lucide-ban',
              color:
                profileData.status === 'Active' ? 'error' : 'success',
              onSelect: async () => {
                if (profileData.status === 'Active') {
                  isBanModalOpen = true;
                  return;
                }

                await client.admin.unbanUser(
                  { userId: props.id },
                  {
                    onResponse: async ({ response }) => {
                      if (response.ok) {
                        toast.add({
                          color: 'success',
                          title: 'Ban removed',
                        });
                        emits('updateProfileInformation')
                      }
                    },
                  },
                );
              },
            },
          ]"
        >
          <UBadge
            :color="profileData.status === 'Active' ? 'success' : 'error'
            "
            variant="subtle"
            class="mt-1"
            size="sm"
            trailing-icon="i-heroicons-chevron-down"
          >
            {{ profileData.status }}
          </UBadge>
        </UDropdownMenu>
        <BanUserModal
          v-model:open="isBanModalOpen"
          :user-id="id"
          :t="props.t"
          @banned="emits('updateProfileInformation')"
        />
      </div>

      <!-- Profile Details -->
      <div class="space-y-4">
        <div class="flex justify-between items-center py-2">
          <span class="text-sm font-medium text-gray-500">ID</span>
          <span class="text-sm">{{ profileData.studentId }}</span>
        </div>
        <div class="flex justify-between items-center py-2 border-b border-gray-100">
          <span class="text-sm font-medium text-gray-500">Email</span>
          <span class="text-sm">{{ profileData.email }}</span>
        </div>
        <div class="flex justify-between items-center py-2 border-b border-gray-100">
          <span class="text-sm font-medium text-gray-500">Gender</span>
          <span class="text-sm">{{ profileData.gender }}</span>
        </div>
        <div class="flex justify-between items-center py-2 border-b border-gray-100">
          <span class="text-sm font-medium text-gray-500">Role(s)</span>
          <span class="text-sm">{{ profileData.role }}</span>
        </div>
        <div class="flex justify-between items-center py-2 border-b border-gray-100">
          <span class="text-sm font-medium text-gray-500">Birthday</span>
          <span
            v-if="profileData.birthday"
            class="text-sm"
          >{{
            formatDate(new Date(profileData.birthday))
          }}</span>
        </div>
      </div>
      <ModalEditProfile
        :profile="props.data"
        @update-profile="emits('updateProfileInformation')"
      />
    </div>
  </UCard>
</template>
