<script setup lang="ts">
import type { InternalApi } from 'nitropack'

const props = defineProps<{
  id: string
  data?: InternalApi['/api/admin/user/:id']['post']
}>()

const emits = defineEmits(['updateEmergencyContacts'])

const emergencyContacts = computed(() => {
  if (!props.data || props.data?.emergency_contacts.length === 0)
    return []
  return props.data?.emergency_contacts.map(e => ({
    id: e.id,
    name: e.name,
    relationship: e.relationship,
    phone: e.phone,
    email: e.email,
    is_primary: e.is_primary
  }))
})
</script>

<template>
  <UCard class="shadow-lg border border-gray-200 rounded-xl overflow-hidden">
    <template #header>
      <div class="flex justify-between">
        <div class="flex items-center gap-3">
          <UIcon
            name="i-heroicons-phone"
            class="text-red-600 text-xl"
          />
          <h2 class="text-lg font-semibold">
            Emergency Contact
          </h2>
        </div>
        <ModalCreateProfileEmergencyContact
          :beneficiary-id="props.id"
          @emergency-contact-added="emits('updateEmergencyContacts')"
        />
      </div>
    </template>
    <div v-if="!emergencyContacts || emergencyContacts.length === 0">
      <div class="text-center">
        <Icon
          name="i-heroicons-phone"
          class="text-red-600 text-xl rounded-full"
        />
      </div>
      <p class="text-center text-xl font-bold text-gray-500">
        No Emergency Contacts
      </p>
      <p class="text-center text-sm text-gray-500">
        Start by adding an emergency contact
      </p>
    </div>
    <div
      v-else
      class="space-y-4"
    >
      <div
        v-for="contact in emergencyContacts"
        :key="contact.id"
        class="p-4 rounded-lg bg-accented"
      >
        <div class="flex justify-between items-start mb-2">
          <h4 class="font-medium">
            {{ contact.name }}
          </h4>
          <UBadge
            color="primary"
            variant="subtle"
            size="md"
          >
            {{ contact.relationship }}
          </UBadge>
        </div>
        <div class="space-y-1 text-sm text-gray-500">
          <div class="flex items-center gap-2">
            <UIcon
              name="i-heroicons-phone"
              class="text-xs"
            />
            <span>{{ contact.phone }}</span>
          </div>
          <div class="flex items-center gap-2">
            <UIcon
              name="i-heroicons-envelope"
              class="text-xs"
            />
            <span>{{ contact.email }}</span>
          </div>
          <UBadge
            v-if="contact.is_primary"
            size="md"
          >
            Primary Contact
          </UBadge>
        </div>
      </div>
    </div>
  </UCard>
</template>
