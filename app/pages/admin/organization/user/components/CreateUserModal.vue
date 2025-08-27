<script setup lang="ts">
import type { CalendarDate } from '@internationalized/date'
import { getLocalTimeZone } from '@internationalized/date'
import { z } from 'zod/v4'

const { t } = defineProps<{
  t: TranFunction
}>()

const emit = defineEmits<{
  created: []
  cancel: []
}>()

const open = defineModel('open', { default: false })

const toast = useToast()
const { client } = useAuth()

const schema = z.object({
  name: z.string().min(4, t('user.validation.nameMin', { n: 4 })),
  email: z.email(t('user.validation.emailInvalid')),
  password: z.string().min(8, t('user.validation.passwordMin', { n: 8 })),
  role: z.enum(['beneficiary', 'instructor', 'admin']),
  dob: z.custom<CalendarDate | null>().refine(x => x?.toDate('utc') instanceof Date, 'Invalid date'),
  gender: z.enum(['female', 'male', 'other'])
})

type Schema = z.output<typeof schema>

const state = shallowReactive({
  name: '',
  email: '',
  password: '',
  role: 'beneficiary' as const,
  dob: null,
  gender: 'other' as const
})

async function onSubmit({ data }: FormSubmitEvent<Schema>) {
  const d = data.dob?.toDate(getLocalTimeZone()).toISOString()

  const payload = {
    name: data.name,
    email: data.email,
    password: data.password,
    role: data.role,
    data: {
      dob: d,
      gender: data.gender

    }
  }

  const res = await client.admin.createUser(payload)

  if (res.error) {
    toast.add({
      color: 'error',
      title: res.error?.message,
      description: res.error?.code
    })
    return
  }

  open.value = false
  emit('created')
  toast.add({
    color: 'success',
    title: `${res.data.user.name} created.`
  })
}

const onCancel = () => {
  open.value = false
  emit('cancel')
}
</script>

<template>
  <UModal
    v-model:open="open"
    :close="true"
    :title="t('user.modals.createUser')"
  >
    <template #body>
      <UForm
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField
          :label="t('global.page.name')"
          name="name"
        >
          <UInput
            v-model="state.name"
            class="w-full"
          />
        </UFormField>

        <UFormField
          :label="t('user.form.email')"
          name="email"
        >
          <UInput
            v-model="state.email"
            class="w-full"
          />
        </UFormField>

        <UFormField
          :label="t('user.form.password')"
          name="password"
        >
          <UInput
            v-model="state.password"
            type="password"
            class="w-full"
          />
        </UFormField>

        <UFormField
          :label="t('user.form.role')"
          name="role"
        >
          <USelect
            v-model="state.role"
            class="w-full"
            :items="[
              { label: t('user.roles.beneficiary'), value: 'beneficiary' },
              { label: t('user.roles.instructor'), value: 'instructor' },
              { label: t('user.roles.admin'), value: 'admin' }
            ]"
          />
        </UFormField>

        <UFormField
          :label="t('user.form.dob')"
          name="dob"
        >
          <DatePicker
            v-model="state.dob"
            class="w-full"
          />
        </UFormField>

        <UFormField
          :label="t('user.form.gender.label')"
          name="gender"
        >
          <USelect
            v-model="state.gender"
            class="w-full"
            :items="[
              { label: t('user.form.gender.male'), value: 'male' },
              { label: t('user.form.gender.female'), value: 'female' },
              { label: t('user.form.gender.other'), value: 'other' }
            ]"
          />
        </UFormField>

        <div class="flex justify-end w-full gap-4">
          <UButton
            color="neutral"
            variant="soft"
            @click="onCancel"
          >
            {{ t('global.page.cancel') }}
          </UButton>
          <UButton
            type="submit"
            color="primary"
          >
            {{ t('global.page.create') }}
          </UButton>
        </div>
      </UForm>
    </template>
  </UModal>
</template>
