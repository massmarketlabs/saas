<script setup lang="ts">
// /app/pages/[org-slug]/admin/beneficiary/components/create-modal.vue

import type { FormErrorEvent } from '@nuxt/ui'
import type { BeneficiaryFormData, CreateBeneficiaryResponse } from '~~/server/api/admin/beneficiary/index.post'
import { FetchError } from 'ofetch'
import { ZodError } from 'zod/v4'
import {

  createBeneficiarySchema
} from '~~/server/api/admin/beneficiary/index.post'

// Type for translation function
interface TranFunction {
  (key: string): string
}

// Props with proper typing
interface Props {
  t: TranFunction
}

const { t } = defineProps<Props>()
const emit = defineEmits(['beneficiaryCreated'])

// Reactive state with proper typing
const isModalOpen = ref(false)
const isLoading = ref(false)
const toast = useToast()

// Type for form errors - more specific than the original
type FormErrors = Partial<Record<keyof BeneficiaryFormData, string>>

// Form validation state
const formErrors = ref<FormErrors>({})

// Form state with proper default values and typing
const createDefaultForm = (): BeneficiaryFormData => ({
  first_name_en: '',
  middle_name_en: '',
  last_name_en: '',
  dob: new Date().toISOString().split('T')[0], // Format as YYYY-MM-DD
  gender: 'other',
  email: null,
  first_name_ar: '',
  middle_name_ar: '',
  last_name_ar: '',
  display_name: '',
  phone: '',
  address: '',
  gid: '',
  organization_id: ''
})

const form = ref<BeneficiaryFormData>(createDefaultForm())

// Reset form function
const resetForm = (): void => {
  form.value = createDefaultForm()
  formErrors.value = {}
}

// Gender options with proper typing
const genderOptions = [
  { label: t('beneficiary.gender.male'), value: 'male' as const },
  { label: t('beneficiary.gender.female'), value: 'female' as const },
  { label: t('beneficiary.gender.other'), value: 'other' as const }
] as const

// Type-safe field error helpers
const getFieldError = (fieldName: keyof BeneficiaryFormData): string | undefined => {
  return formErrors.value[fieldName]
}

const hasFieldError = (fieldName: keyof BeneficiaryFormData): boolean => {
  return Boolean(formErrors.value[fieldName])
}

// Type-safe error handling for API responses
interface APIValidationError {
  field: string
  message: string
  code: 'validation_error'
}

interface APIErrorResponse {
  data: {
    errors: APIValidationError[]
  }
}

// Helper to handle API validation errors
const handleAPIValidationErrors = (errors: APIValidationError[]): void => {
  const errorMap: FormErrors = {}

  errors.forEach((err) => {
    const fieldName = err.field as keyof BeneficiaryFormData
    if (fieldName in form.value) {
      errorMap[fieldName] = err.message
    }
  })

  formErrors.value = errorMap
}

// Generate display name automatically
watch(
  [() => form.value.first_name_en, () => form.value.last_name_en],
  ([firstName, lastName]) => {
    if (firstName && lastName) {
      form.value.display_name = `${firstName} ${lastName}`
    }
  }
)

// Form submission with comprehensive error handling
const handleSubmit = async (): Promise<void> => {
  try {
    isLoading.value = true
    formErrors.value = {}

    // Client-side validation first
    const validatedData = createBeneficiarySchema.parse(form.value)

    // Make API call with proper typing
    const result = await $fetch<CreateBeneficiaryResponse>('/api/admin/beneficiary', {
      method: 'POST',
      body: validatedData
    })

    console.log('Beneficiary created successfully:', result)

    // Show success message
    toast.add({
      color: 'success',
      title: 'Success!',
      description: result.message || 'Beneficiary created successfully'
    })

    // Reset and close
    resetForm()
    isModalOpen.value = false

    // Emit event for parent component to refresh data
    // You can add an emit here if needed
    emit('beneficiaryCreated')
  } catch (error) {
    console.error('Error creating beneficiary:', error)

    if (error instanceof ZodError) {
      // Handle client-side validation errors
      const errorMap: FormErrors = {}
      error.issues.forEach((issue) => {
        const fieldName = issue.path[0] as keyof BeneficiaryFormData
        if (fieldName in form.value) {
          errorMap[fieldName] = issue.message
        }
      })
      formErrors.value = errorMap

      toast.add({
        color: 'error',
        title: 'Validation Error',
        description: 'Please check the form fields and try again.'
      })
    } else if (error instanceof FetchError) {
      // Handle server-side validation errors
      const errorResponse = error.data as APIErrorResponse

      if (errorResponse?.data?.errors) {
        handleAPIValidationErrors(errorResponse.data.errors)

        toast.add({
          color: 'error',
          title: 'Validation Error',
          description: 'Please check the form fields and try again.'
        })
      } else {
        toast.add({
          color: 'error',
          title: 'Server Error',
          description: error.statusMessage || 'Server error occurred. Please try again.'
        })
      }
    } else {
      // Handle unexpected errors
      toast.add({
        color: 'error',
        title: 'Unexpected Error',
        description: 'An unexpected error occurred. Please try again.'
      })
    }
  } finally {
    isLoading.value = false
  }
}

// Reset errors when modal closes
watch(isModalOpen, (isOpen) => {
  if (!isOpen) {
    formErrors.value = {}
  }
})

// Type-safe form error handler
const onError = async (event: FormErrorEvent): Promise<void> => {
  if (event?.errors?.[0]?.id) {
    const element = document.getElementById(event.errors[0].id)
    element?.focus()
    element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

// Set joined_at to today by default on component mount
onMounted(() => {
  form.value.dob = new Date().toISOString().split('T')[0]
})
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
              required
            >
              <UInput
                v-model="form.gid"
                :placeholder="t('beneficiary.placeholders.gid')"
                :disabled="isLoading"
                :class="{ 'border-red-500': hasFieldError('gid') }"
                class="w-full"
              />
              <template #hint>
                <span class="text-sm text-gray-500">
                  {{ t('beneficiary.hints.gid') }}
                </span>
              </template>
            </UFormField>

            <!-- DOB and Gender -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
              <!-- Date of Birth -->
              <UFormField
                :label="t('beneficiary.fields.dateOfBirth')"
                :error="getFieldError('dob')"
                required
              >
                <UInput
                  v-model="form.dob"
                  type="date"
                  :disabled="isLoading"
                  :class="{ 'border-red-500': hasFieldError('dob') }"
                  class="w-full"
                />
              </UFormField>

              <!-- Gender -->
              <UFormField
                :label="t('beneficiary.fields.gender')"
                :error="getFieldError('gender')"
                required
              >
                <USelect
                  v-model="form.gender"
                  :options="genderOptions"
                  :placeholder="t('beneficiary.placeholders.gender')"
                  :disabled="isLoading"
                  :class="{ 'border-red-500': hasFieldError('gender') }"
                  class="w-full"
                />
              </UFormField>
            </div>
          </div>

          <!-- Optional Information Section -->
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
                    :class="{ 'border-red-500': hasFieldError('first_name_ar') }"
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
                    :class="{ 'border-red-500': hasFieldError('middle_name_ar') }"
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
                    :class="{ 'border-red-500': hasFieldError('last_name_ar') }"
                    dir="rtl"
                  />
                </UFormField>
              </template>
            </FlexThreeColumn>

            <!-- Display Name -->
            <UFormField
              :label="t('beneficiary.fields.displayName')"
              :error="getFieldError('display_name')"
            >
              <UInput
                v-model="form.display_name"
                :placeholder="t('beneficiary.placeholders.displayName')"
                :disabled="isLoading"
                :class="{ 'border-red-500': hasFieldError('display_name') }"
                class="w-full"
              />
            </UFormField>

            <!-- Email -->
            <UFormField
              :label="t('beneficiary.fields.email')"
              :error="getFieldError('email')"
            >
              <UInput
                v-model="form.email"
                type="email"
                :placeholder="t('beneficiary.placeholders.email')"
                :disabled="isLoading"
                :class="{ 'border-red-500': hasFieldError('email') }"
                class="w-full"
              />
            </UFormField>

            <!-- Phone -->
            <UFormField
              :label="t('beneficiary.fields.phone')"
              :error="getFieldError('phone')"
            >
              <UInput
                v-model="form.phone"
                type="tel"
                :placeholder="t('beneficiary.placeholders.phone')"
                :disabled="isLoading"
                :class="{ 'border-red-500': hasFieldError('phone') }"
                class="w-full"
              />
            </UFormField>

            <!-- Address -->
            <UFormField
              :label="t('beneficiary.fields.address')"
              :error="getFieldError('address')"
            >
              <UTextarea
                v-model="form.address"
                :placeholder="t('beneficiary.placeholders.address')"
                :disabled="isLoading"
                :class="{ 'border-red-500': hasFieldError('address') }"
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
            :disabled="isLoading"
            @click="handleSubmit"
          >
            {{ t('beneficiary.actions.create.submit') }}
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
