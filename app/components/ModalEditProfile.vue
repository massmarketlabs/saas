<script setup lang="ts">
import type { ZonedDateTime } from '@internationalized/date'
import type { InternalApi } from 'nitropack'
import { parseAbsoluteToLocal } from '@internationalized/date'
import { z } from 'zod/v4'

const props = defineProps<{ profile: InternalApi['/api/admin/user/:id']['get'] | undefined }>()
const emit = defineEmits(['updateProfile'])
const form = useTemplateRef('update-profile')
const toast = useToast()
const schema = z.object({
  dob: z.custom<ZonedDateTime | null>().refine(x => x?.toDate(), 'Invalid date'),
  gender: z.enum(['female', 'male', 'other']),
  role: z.array(z.enum(['admin', 'instructor', 'beneficiary']))
})

const roles = [{ label: 'Admin', value: 'admin' }, { label: 'Instructor', value: 'instructor' }, { label: 'Beneficiary', value: 'beneficiary' }]
type Schema = z.infer<typeof schema>

const { client } = useAuth()

const onSubmit = async (data: FormSubmitEvent<Schema>) => {
  if (!props.profile?.id) {
    return
  }

  const dob = data.data.dob?.toDate().toISOString()
  await client.admin.updateUser({
    userId: props.profile.id,
    data: {
      dob,
      gender: data.data.gender,
      role: data.data.role.join(',')
    },
    fetchOptions: {
      onResponse: ({ response }) => {
        if (response.ok) {
          toast.add({ color: 'success', title: 'Updated' })
          emit('updateProfile')
        }
      },
      onError: ({ error }) => {
        if (error)
          toast.add({ color: 'error', title: error.message })
      }
    }
  })
}

const state = shallowReactive<Partial<Schema>>({
  gender: props.profile?.gender as 'male' | 'female' | 'other' ?? 'unknown',
  dob: props.profile?.dob ? parseAbsoluteToLocal(new Date(props.profile?.dob).toISOString()) : null,
  role: props.profile?.role?.split(',') as []
})
</script>

<template>
  <UModal
    title="Edit Profile"
    description="Edit name, gender, date of birth and role within the system."
  >
    <UButton
      color="primary"
      variant="outline"
      block
      icon="i-heroicons-pencil-square"
    >
      Edit Profile
    </UButton>

    <template #body>
      <UForm
        ref="update-profile"
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField
          label="Date of Birth"
          name="dob"
        >
          <DatePicker
            v-model="state.dob"
            class="w-full"
          />
        </UFormField>
        <UFormField
          label="Gender"
          name="gender"
        >
          <USelect
            v-model="state.gender"
            class="w-full"
            :items="[
              { label: 'Male', value: 'male' },
              { label: 'Female', value: 'female' },
              { label: 'Other', value: 'other' }
            ]"
          />
        </UFormField>
        <UFormField
          label="Role"
          name="role"
        >
          <USelect
            v-model="state.role"
            class="w-full"
            :items="roles"
            multiple
          />
        </UFormField>
      </UForm>
    </template>
    <template #footer>
      <UButton
        label="Submit"

        @click="form?.submit"
      />
    </template>
  </UModal>
</template>
