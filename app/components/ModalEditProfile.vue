<script setup lang="ts">
import type { ZonedDateTime } from '@internationalized/date'
import type { InternalApi } from 'nitropack'
import { parseAbsoluteToLocal } from '@internationalized/date'
import { z } from 'zod/v4'

const props = defineProps<{ profile?: InternalApi['/api/admin/user/:id']['post'] }>()
const emit = defineEmits(['updateProfile'])
const toast = useToast()

const newImageKey = ref(props.profile?.image ? props.profile.image : '')
const form = useTemplateRef('update-profile')

const schema = z.object({
  dob: z.custom<ZonedDateTime | null>().refine(x => x?.toDate(), 'Invalid date'),
  image: z.file().optional().nullable(),
  name: z.string(),
  gender: z.enum(['female', 'male', 'other']),
  role: z.array(z.enum(['admin', 'instructor', 'beneficiary']))
})

const { data: imageFile } = await useFetch(props.profile?.imageUrl ?? '', {
  immediate: !!props.profile?.imageUrl,
  method: 'get',
  responseType: 'blob',
  server: false,
  transform: (b: Blob) => {
    if (!b)
      return null
    return new File([b], 'avatar.jpeg', { type: b.type })
  }
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
      image: newImageKey.value === '' ? null : newImageKey.value,
      name: data.data.name,
      dob,
      gender: data.data.gender,
      role: data.data.role.join(',')
    },
    fetchOptions: {
      onResponse: ({ response }) => {
        if (response.ok) {
          toast.add({ color: 'success', title: 'Profile Updated' })
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
  image: null,
  name: props.profile?.name,
  gender: props.profile?.gender as 'male' | 'female' | 'other' ?? 'unknown',
  dob: props.profile?.dob ? parseAbsoluteToLocal(new Date(props.profile?.dob).toISOString()) : null,
  role: props.profile?.role?.split(',') as []
})

const handleFileChange = async (payload: unknown) => {
  const file = payload as File

  if (!file) {
    state.image = null
    newImageKey.value = ''
    return
  }

  try {
    // Create FormData for file upload
    const formData = new FormData()
    formData.append('file', file)

    // Upload file to S3 endpoint
    const response = await useFetch('/api/admin/storage', {
      method: 'POST',
      body: formData
    })

    if (response.error.value || !response.data.value?.key) {
      throw new Error(`Upload failed: ${response.error.value?.message}`)
    }
    newImageKey.value = response.data.value?.key

    toast.add({
      color: 'success',
      title: 'Image uploaded successfully'
    })
  }
  catch (error) {
    console.error('Upload error:', error)

    // Show error toast
    toast.add({
      color: 'error',
      title: 'Failed to upload image',
      description: error instanceof Error ? error.message : 'Unknown error'
    })

    // Reset the file input on error
    state.image = null
  }
}

watch(imageFile, () => {
  if (imageFile)
    state.image = imageFile.value
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
          label="Image"
          name="image"
        >
          <UFileUpload
            v-model="state.image"
            accept="image/*"
            file-delete
            icon="i-heroicons-camera"
            size="lg"
            color="primary"
            class="w-24 h-24 rounded-full mx-auto"
            @update:model-value="handleFileChange"
          />
        </UFormField>
        <UFormField
          label="Name"
          name="name"
        >
          <UInput
            v-model="state.name"
            class="w-full"
          />
        </UFormField>
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
