<script setup lang="ts">
import type { RequestInsertUserEmergencyContact } from '~~/server/internal/user/zod-types'
import { insertUserEmergencyContact } from '~~/server/internal/user/zod-types'

const props = defineProps<{ beneficiaryId: string }>()
const emit = defineEmits(['emergencyContactAdded'])

const toast = useToast()
const form = useTemplateRef('create-profile-emergency-contact')

const state = reactive<Partial<RequestInsertUserEmergencyContact>>({ user_id: props.beneficiaryId })

const resetForm = () => {
  Object.keys(state).forEach((key) => {
    if (key !== 'user_id') { // Keep the user_id
      delete state[key as keyof typeof state]
    }
  })
  // Or alternatively:
  // Object.assign(state, { user_id: props.beneficiaryId })
}

const onSubmit = async (event: FormSubmitEvent<RequestInsertUserEmergencyContact>) => {
  console.log('submitting', event.data)
  await $fetch('/api/admin/user/emergency-contact', {
    method: 'post',
    body: event.data,
    onResponseError: ({ error }) => {
      toast.add({ color: 'error', title: error?.message })
    },
    onResponse: ({ response }) => {
      if (response.ok) {
        toast.add({ color: 'success', title: 'Emergency Contact Info' })
        emit('emergencyContactAdded')
        resetForm()
      }
    }
  })
}
</script>

<template>
  <UModal
    title="Add Contact"
    description="In an emergency, its crucial to know who to contact."
  >
    <UButton
      color="primary"
      variant="outline"
      size="sm"
      icon="i-heroicons-plus"
    >
      Add Contact
    </UButton>
    <template #body>
      <UForm
        ref="create-profile-emergency-contact"
        class="space-y-4"
        :state="state"
        :schema="insertUserEmergencyContact"
        @submit="onSubmit"
      >
        <UFormField
          name="name"
          label="Name"
        >
          <UInput
            v-model="state.name"
            placeholder="Name"
            class="w-full"
          />
        </UFormField>
        <UFormField
          name="phone"
          label="Phone #"
        >
          <UInput
            v-model="state.phone"
            placeholder="Phone"
            class="w-full"
            type="tel"
          />
        </UFormField>
        <UFormField
          name="email"
          label="Email"
        >
          <UInput
            v-model="state.email"
            placeholder="Email"
            class="w-full"
            type="email"
          />
        </UFormField>
        <UFormField
          name="priority"
          label="Priority"
        >
          <USelect
            v-model="state.relationship"
            placeholder="Relationship"
            class="w-full"
            :items="[{ label: 'Mother', value: 'mother' }, { label: 'Father', value: 'father' }, { label: 'Sibling', value: 'sibling' }]"
          />
        </UFormField>
        <UFormField name="is_primary">
          <UCheckbox
            v-model="state.is_primary as boolean"
            label="Primary Contact"
            description="Set this contact as preferred contact to reach"
            class="w-full"
            :items="[{ label: 'Mother', value: 'mother' }, { label: 'Father', value: 'father' }, { label: 'Sibling', value: 'sibling' }]"
          />
        </UFormField>
      </UForm>
    </template>
    <template #footer>
      <UButton @click="form?.submit">
        Submit
      </UButton>
    </template>
  </UModal>
</template>
