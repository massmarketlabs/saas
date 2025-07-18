<script setup lang="ts">
import * as z from 'zod/v4'

definePageMeta({
  layout: false
})

const { user, client, fetchSession } = useAuth()

const runtimeConfig = useRuntimeConfig()
const toast = useToast()
const localePath = useLocalePath()

const schema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  logo: z.instanceof(File)
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({})

const slugDesc = computed(() => `You will use this to access your specific organization at: ${runtimeConfig.public.baseURL}/${state.slug ?? ''}`)

const onFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]

  if (file) {
    state.logo = file
  }
}

const onSubmit = async (payload: FormSubmitEvent<Partial<Schema>>) => {
  const { name, slug, logo } = payload.data

  if (!name || !slug) {
    console.error('Missing name or slug')
    toast.add({ color: 'error', title: 'Missing name or slug' })
    return
  }

  // Upload logo
  let logoUrl = ''

  if (logo) {
    const uploadForm = new FormData()
    uploadForm.append('logo', logo)

    const uploadRes = await $fetch<{ key: string, url: string }>('/api/upload-logo', {
      method: 'POST',
      body: uploadForm
    })

    if (uploadRes && uploadRes.url) {
      logoUrl = uploadRes.url
    }
  }

  // check if slug exists
  const checkSlug = await client.organization.checkSlug({ slug })

  if (checkSlug.error) {
    toast.add({ color: 'error', title: checkSlug.error.message, description: checkSlug.error.statusText })
    return
  }

  if (!checkSlug.data.status) {
    toast.add({ color: 'error', title: 'Slug has already been taken. Try something else.' })
    return
  }

  // Send JSON to create the organization
  const organization = { name, slug, logo: logoUrl }

  const createOrgRequest = await client.organization.create(organization)
  if (createOrgRequest.error) {
    toast.add({ color: 'error', title: 'Unable to create organization. Please Try again later.', description: 'If this issue persists, please contact an administrator.' })
    return
  }
  console.log('Organization created!')
  toast.add({ color: 'success', title: 'Organization created', description: 'You will be redirected shortly' })

  // set active organization
  await client.organization.setActive({
    organizationSlug: slug
  })

  // await client.signOut()
  // await signOut({ redirectTo: localePath('/signin') })
  await fetchSession()

  // Start redirect process
  await navigateTo(localePath(`${slug}/admin`))
  // await navigateTo(localePath('/'))
}
</script>

<template>
  <NuxtLayout name="default">
    <template #nav-right>
      <span> Organization Onboarding </span>
    </template>
    <UCard class="my-16 w-full sm:w-xl md:w-3xl lg:w-5xl xl:w-6xl">
      <template #header>
        <h3 class="text-2xl font-semibold">
          Hello, {{ user?.name }}
        </h3>
        <h6 class="text-md text-gray-500 dark:text-">
          Let's get started by creating your first organization.
        </h6>
      </template>

      <UForm
        :schema="schema"
        :state="state"
        class="space-y-4 w-full sm:w-1/2"
        @submit="onSubmit"
      >
        <UFormField
          label="Name"
          name="name"
          help="You can change this later."
          required
        >
          <UInput
            v-model="state.name"
            class="w-full"
          />
        </UFormField>
        <UFormField
          label="Slug"
          name="slug"
          :description="slugDesc"
          required
        >
          <UInput
            v-model="state.slug"
            class="w-full"
          />
        </UFormField>
        <UFormField
          label="Logo"
          name="logo"
        >
          <UInput
            type="file"
            accept="image/*"
            class="w-full"
            @change="onFileChange"
          />
        </UFormField>
        <UButton type="submit">
          Submit
        </UButton>
      </UForm>
    </UCard>
  </NuxtLayout>
</template>
