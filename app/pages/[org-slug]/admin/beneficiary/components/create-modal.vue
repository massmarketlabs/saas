<script setup lang="ts">
import type { AcceptableValue, FormErrorEvent } from '@nuxt/ui'
import type { z } from 'zod/v4'
import { createInsertSchema } from 'drizzle-zod'
import { z as zod, ZodError } from 'zod/v4'
import { beneficiary } from '~~/server/database/schema'

const { t } = defineProps<{
  t: TranFunction
}>()

const isModalOpen = ref(false)
const isLoading = ref(false)

// Create the validation schema with proper typing
const schema = createInsertSchema(beneficiary, {
  // Make required fields explicit
  first_name_en: zod.string().min(1, 'First name is required'),
  middle_name_en: zod.string().min(1, 'Middle name is required'),
  last_name_en: zod.string().min(1, 'Last name is required'),
  gid: zod.string().min(1, 'Government Issued Identification Number is required.'),
  email: zod.email().or(zod.literal('')),
  phone: zod.string().optional(),
  dob: zod.date().optional(),
  gender: zod.enum(['male', 'female', 'other']).optional()
})

// Infer the type from the schema
type BeneficiaryFormData = z.infer<typeof schema>

// Form state with proper typing
const form = ref<BeneficiaryFormData>({
  // Required fields
  first_name_en: '',
  middle_name_en: '',
  last_name_en: '',

  // Optional name fields
  email: '',
  first_name_ar: '',
  middle_name_ar: '',
  last_name_ar: '',
  display_name: '',

  // Profile fields
  dob: new Date(),
  gender: undefined,
  phone: '',
  address: '',

  // Organization fields
  gid: '',
  joined_at: ''
})

// Reset form function with proper typing
const resetForm = () => {
  const defaultForm: BeneficiaryFormData = {
    first_name_en: '',
    last_name_en: '',
    email: '',
    middle_name_en: '',
    first_name_ar: '',
    middle_name_ar: '',
    last_name_ar: '',
    display_name: '',
    dob: new Date(),
    gender: undefined,
    phone: '',
    address: '',
    gid: '',
    joined_at: new Date().toISOString().split('T')[0]
  }

  form.value = { ...defaultForm }
}

// Gender options with proper typing
const genderOptions = [
  { label: t('beneficiary.gender.male'), value: 'male' as const },
  { label: t('beneficiary.gender.female'), value: 'female' as const },
  { label: t('beneficiary.gender.other'), value: 'other' as const }
]

// Form validation state - properly typed error object
const formErrors = ref<Partial<Record<keyof BeneficiaryFormData, string>>>({})

// Generate display name automatically
watch([() => form.value.first_name_en, () => form.value.last_name_en], () => {
  if (form.value.first_name_en && form.value.last_name_en) {
    form.value.display_name = `${form.value.first_name_en} ${form.value.last_name_en}`
  }
})

// Set joined_at to today by default
onMounted(() => {
  form.value.joined_at = new Date().toISOString().split('T')[0]
})

// Form submission with proper error handling
const handleSubmit = async () => {
  try {
    isLoading.value = true
    formErrors.value = {}

    // Validate the form
    const validatedData = schema.parse(form.value)
    console.log({ validatedData })

    // Here you would typically call your API endpoint
    // const result = await $fetch('/api/beneficiaries', {
    //   method: 'POST',
    //   body: validatedData
    // })

    console.log('Form submitted:', validatedData)

    // Reset form and close modal
    resetForm()
    isModalOpen.value = false

    // Show success message
    // You might want to emit an event or show a toast notification
  } catch (error: any) {
    if (error instanceof ZodError) {
      console.log({ error: error.issues })
      // Handle Zod validation errors with proper typing
      const errorMap: Partial<Record<keyof BeneficiaryFormData, string>> = {}
      error.issues.forEach((err) => {
        const fieldName = err.path[0] as keyof BeneficiaryFormData
        errorMap[fieldName] = err.message
      })
      formErrors.value = errorMap
    } else {
      console.error('Error creating beneficiary:', error)
      // Handle other errors
    }
  } finally {
    isLoading.value = false
  }
}

// Reset form when modal closes
watch(isModalOpen, (isOpen) => {
  if (!isOpen) {
    formErrors.value = {}
  }
})

// Computed property for form validation state
// const isFormValid = computed(() => {
//   return form.value.first_name_en.trim() !== ''
//     && form.value.middle_name_en.trim() !== ''
//     && form.value.last_name_en.trim() !== ''
//     && /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/.test(form.value.email)
// })

// Type-safe field getters for easier access
const getFieldError = (fieldName: keyof BeneficiaryFormData): string | undefined => {
  return formErrors.value[fieldName]
}

const hasFieldError = (fieldName: keyof BeneficiaryFormData): boolean => {
  return Boolean(formErrors.value[fieldName])
}
async function onError(event: FormErrorEvent) {
  if (event?.errors?.[0]?.id) {
    const element = document.getElementById(event.errors[0].id)
    element?.focus()
    element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}
</script>

<template>
  <div>
    <!-- Trigger Button -->
    <UButton
      color="neutral"
      icon="i-lucide-plus"
      variant="outline"
      :label="t('beneficiary.actions.create.title')"
      @click="isModalOpen = true"
    />

    <!-- Modal -->
    <UModal
      v-model:open="isModalOpen"
      :title="t('beneficiary.actions.create.title')"
      :description="t('beneficiary.actions.create.description')"
    >
      <template #body>
        <UForm
          :state="form"
          class="space-y-4"
          @submit.prevent="handleSubmit"
          @error="onError"
        >
          <!-- Required Information Section -->
          <div class="space-y-3">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ t('beneficiary.sections.required') }}
            </h3>
            <!-- English Name -->
            <FlexThreeColumn>
              <template #left>
                <UFormField
                  :label="t('beneficiary.fields.firstName')"
                  :error="getFieldError('first_name_en')"
                  required
                >
                  <UInput
                    v-model="form.first_name_en"
                    :placeholder="t('beneficiary.placeholders.firstName')"
                    :disabled="isLoading"
                    :class="{ 'border-red-500': hasFieldError('first_name_en') }"
                  />
                </UFormField>
              </template>
              <template #middle>
                <UFormField
                  :label="t('beneficiary.fields.middleName')"
                  :error="getFieldError('middle_name_en')"
                  required
                >
                  <UInput
                    v-model="form.middle_name_en"
                    :placeholder="t('beneficiary.placeholders.middleName')"
                    :disabled="isLoading"
                    :class="{ 'border-red-500': hasFieldError('middle_name_en') }"
                  />
                </UFormField>
              </template>
              <template #right>
                <UFormField
                  :label="t('beneficiary.fields.lastName')"
                  :error="getFieldError('last_name_en')"
                  required
                >
                  <UInput
                    v-model="form.last_name_en"
                    :placeholder="t('beneficiary.placeholders.lastName')"
                    :disabled="isLoading"
                    :class="{ 'border-red-500': hasFieldError('last_name_en') }"
                  />
                </UFormField>
              </template>
            </FlexThreeColumn>
            <!-- GID -->
            <UFormField
              :label="t('beneficiary.fields.gid')"
              :error="getFieldError('gid')"
            >
              <UInput
                v-model="form.gid"
                :placeholder="t('beneficiary.placeholders.gid')"
                :disabled="isLoading"
                class="w-full"
              />
              <template #hint>
                <span class="text-sm text-gray-500">
                  {{ t('beneficiary.hints.gid') }}
                </span>
              </template>
            </UFormField>
          </div>

          <!-- Optional Name Information Section -->
          <div class="space-y-3">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ t('beneficiary.sections.additionalDetails') }}
            </h3>
            <!-- Arabic Names -->
            <FlexThreeColumn>
              <template #left>
                <UFormField
                  :label="t('beneficiary.fields.firstNameAr')"
                  :error="getFieldError('first_name_ar')"
                >
                  <UInput
                    v-model="form.first_name_ar"
                    :placeholder="t('beneficiary.placeholders.firstNameAr')"
                    :disabled="isLoading"
                    dir="rtl"
                  />
                </UFormField>
              </template>
              <template #middle>
                <UFormField
                  :label="t('beneficiary.fields.middleNameAr')"
                  :error="getFieldError('middle_name_ar')"
                >
                  <UInput
                    v-model="form.middle_name_ar"
                    :placeholder="t('beneficiary.placeholders.middleNameAr')"
                    :disabled="isLoading"
                    dir="rtl"
                  />
                </UFormField>
              </template>
              <template #right>
                <UFormField
                  :label="t('beneficiary.fields.lastNameAr')"
                  :error="getFieldError('last_name_ar')"
                >
                  <UInput
                    v-model="form.last_name_ar"
                    :placeholder="t('beneficiary.placeholders.lastNameAr')"
                    :disabled="isLoading"
                    dir="rtl"
                  />
                </UFormField>
              </template>
            </FlexThreeColumn>

            <!-- Display Name -->
            <div>
              <UFormField
                :label="t('beneficiary.fields.displayName')"
                :error="getFieldError('display_name')"
              >
                <UInput
                  v-model="form.display_name"
                  :placeholder="t('beneficiary.placeholders.displayName')"
                  :disabled="isLoading"
                  class="w-full"
                />
              </UFormField>
            </div>

            <!-- Email -->
            <div>
              <UFormField
                :label="t('beneficiary.fields.email')"
                :error="getFieldError('email')"
              >
                <UInput
                  v-model="form.email"
                  type="email"
                  :placeholder="t('beneficiary.placeholders.email')"
                  :disabled="isLoading"
                  class="w-full"
                  :class="{ 'border-red-500': hasFieldError('email') }"
                />
              </UFormField>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
            <!-- Date of Birth -->
            <UFormField
              :label="t('beneficiary.fields.dateOfBirth')"
              :error="getFieldError('dob')"
            >
              <UInput
                v-model="form.dob as unknown as AcceptableValue"
                type="date"
                :disabled="isLoading"
                class="w-full"
              />
            </UFormField>
            <!-- Gender -->
            <UFormField
              :label="t('beneficiary.fields.gender')"
              :error="getFieldError('gender')"
            >
              <USelect
                v-model="form.gender"
                :items="genderOptions"
                :placeholder="t('beneficiary.placeholders.gender')"
                :disabled="isLoading"
                class="w-full"
              />
            </UFormField>
          </div>
          <!-- Phone -->
          <div>
            <UFormField
              :label="t('beneficiary.fields.phone')"
              :error="getFieldError('phone')"
            >
              <UInput
                v-model="form.phone"
                type="tel"
                :placeholder="t('beneficiary.placeholders.phone')"
                :disabled="isLoading"
                class="w-full"
              />
            </UFormField>
          </div>
          <!-- Address -->
          <div>
            <UFormField
              :label="t('beneficiary.fields.address')"
              :error="getFieldError('address')"
            >
              <UTextarea
                v-model="form.address"
                :placeholder="t('beneficiary.placeholders.address')"
                :disabled="isLoading"
                class="w-full"
                :rows="3"
              />
            </UFormField>
          </div>
        </UForm>
      </template>

      <template #footer>
        <div class="flex justify-end space-x-2">
          <UButton
            type="button"
            variant="ghost"
            :disabled="isLoading"
            @click="isModalOpen = false"
          >
            {{ t('global.page.cancel') }}
          </UButton>

          <UButton
            type="button"
            :loading="isLoading"
            :disabled="isLoading "
            @click="handleSubmit"
          >
            {{ t('beneficiary.actions.create.submit') }}
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
