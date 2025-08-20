<script setup lang="ts">
// Page metadata
definePageMeta({
  title: 'Organization Settings',
  layout: false
})

// Reactive state
const isSaving = ref(false)
const isResetting = ref(false)
const toast = useToast()

// Settings data
const settings = ref({
  organizationName: 'Acme Learning Academy',
  description: 'Providing world-class educational experiences for professionals',
  website: 'https://acmelearning.com',
  timezone: 'America/New_York',
  primaryLanguage: 'en',
  supportedLanguages: ['en', 'es', 'fr'],
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '12',
  defaultCourseDuration: 12,
  defaultPassGrade: 70,
  allowSelfEnrollment: true,
  requireApproval: false,
  enableCertificates: true,
  contactEmail: 'admin@acmelearning.com',
  notifyNewEnrollments: true,
  notifyCompletions: true,
  sendWelcomeEmails: true,
  sendReminderEmails: true,
  dataRetentionPeriod: 36,
  allowDataExport: true,
  enableTwoFactor: false,
  enableAuditLog: true
})

// Timezone options (sample of major timezones)
const timezoneOptions = [
  { label: 'Eastern Time (UTC-5)', value: 'America/New_York' },
  { label: 'Central Time (UTC-6)', value: 'America/Chicago' },
  { label: 'Mountain Time (UTC-7)', value: 'America/Denver' },
  { label: 'Pacific Time (UTC-8)', value: 'America/Los_Angeles' },
  { label: 'UTC', value: 'UTC' },
  { label: 'London (UTC+0)', value: 'Europe/London' },
  { label: 'Paris (UTC+1)', value: 'Europe/Paris' },
  { label: 'Tokyo (UTC+9)', value: 'Asia/Tokyo' },
  { label: 'Sydney (UTC+10)', value: 'Australia/Sydney' },
  { label: 'Mumbai (UTC+5:30)', value: 'Asia/Kolkata' }
]

// Language options
const languageOptions = [
  { label: 'English', value: 'en' },
  { label: 'Spanish', value: 'es' },
  { label: 'French', value: 'fr' },
  { label: 'German', value: 'de' },
  { label: 'Italian', value: 'it' },
  { label: 'Portuguese', value: 'pt' },
  { label: 'Chinese (Simplified)', value: 'zh-CN' },
  { label: 'Chinese (Traditional)', value: 'zh-TW' },
  { label: 'Japanese', value: 'ja' },
  { label: 'Korean', value: 'ko' },
  { label: 'Arabic', value: 'ar' },
  { label: 'Russian', value: 'ru' },
  { label: 'Dutch', value: 'nl' },
  { label: 'Swedish', value: 'sv' },
  { label: 'Norwegian', value: 'no' }
]

// Date format options
const dateFormatOptions = [
  { label: 'MM/DD/YYYY (US)', value: 'MM/DD/YYYY' },
  { label: 'DD/MM/YYYY (EU)', value: 'DD/MM/YYYY' },
  { label: 'YYYY-MM-DD (ISO)', value: 'YYYY-MM-DD' },
  { label: 'DD MMM YYYY', value: 'DD MMM YYYY' }
]

// Time format options
const timeFormatOptions = [
  { label: '12-hour (AM/PM)', value: '12' },
  { label: '24-hour', value: '24' }
]

// Methods
async function saveSettings() {
  isSaving.value = true

  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    toast.add({
      title: 'Settings Saved',
      description: 'Organization settings have been updated successfully.',
      color: 'success'
    })
  } catch {
    toast.add({
      title: 'Error',
      description: 'Failed to save settings. Please try again.',
      color: 'error'
    })
  } finally {
    isSaving.value = false
  }
}

async function resetSettings() {
  isResetting.value = true

  try {
    // Simulate API call to get default settings
    await new Promise(resolve => setTimeout(resolve, 500))

    // Reset to default values
    settings.value = {
      organizationName: '',
      description: '',
      website: '',
      timezone: 'UTC',
      primaryLanguage: 'en',
      supportedLanguages: ['en'],
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12',
      defaultCourseDuration: 8,
      defaultPassGrade: 70,
      allowSelfEnrollment: false,
      requireApproval: true,
      enableCertificates: false,
      contactEmail: '',
      notifyNewEnrollments: false,
      notifyCompletions: false,
      sendWelcomeEmails: false,
      sendReminderEmails: false,
      dataRetentionPeriod: 24,
      allowDataExport: true,
      enableTwoFactor: false,
      enableAuditLog: false
    }

    toast.add({
      title: 'Settings Reset',
      description: 'All settings have been reset to default values.',
      color: 'warning'
    })
  } finally {
    isResetting.value = false
  }
}

function previewSettings() {
  toast.add({
    title: 'Preview Mode',
    description: 'Settings preview functionality would be implemented here.',
    color: 'primary'
  })
}
</script>

<template>
  <NuxtLayout name="admin">
    <form
      class="space-y-8"
      @submit.prevent="saveSettings"
    >
      <!-- General Settings -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon
              name="i-heroicons-cog-6-tooth"
              class="w-5 h-5"
            />
            <h2 class="text-xl font-semibold">
              General Settings
            </h2>
          </div>
        </template>
        <div class="space-y-3">
          <div class="grid lg:space-x-6 lg:grid-cols-2">
            <!-- Organization Name -->
            <UFormField
              label="Organization Name"
              name="organizationName"
              required
            >
              <UInput
                v-model="settings.organizationName"
                placeholder="Enter your organization name"
                class="w-full"
              />
            </UFormField>

            <!-- Website -->
            <UFormField
              label="Website"
              name="website"
            >
              <UInput
                v-model="settings.website"
                placeholder="https://example.com"
                type="url"
                class="w-full"
              />
            </UFormField>
          </div>

          <!-- Description -->
          <UFormField
            label="Description"
            name="description"
          >
            <UTextarea
              v-model="settings.description"
              placeholder="Brief description of your organization"
              :rows="3"
              class="w-full"
            />
          </UFormField>
        </div>
      </UCard>

      <!-- Localization Settings -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon
              name="i-heroicons-globe-alt"
              class="w-5 h-5"
            />
            <h2 class="text-xl font-semibold">
              Localization
            </h2>
          </div>
        </template>

        <div class="space-y-6">
          <!-- Timezone -->
          <UFormField
            label="Default Timezone"
            name="timezone"
            required
          >
            <USelect
              v-model="settings.timezone"
              :items="timezoneOptions"
              option-attribute="label"
              value-attribute="value"
              searchable
              placeholder="Select timezone"
              size="lg"
            />
          </UFormField>

          <!-- Primary Language -->
          <UFormField
            label="Primary Language"
            name="primaryLanguage"
            required
          >
            <USelect
              v-model="settings.primaryLanguage"
              :items="languageOptions"
              option-attribute="label"
              value-attribute="value"
              searchable
              placeholder="Select primary language"
              size="lg"
            />
          </UFormField>

          <!-- Additional Languages -->
          <UFormField
            label="Additional Languages Supported"
            name="supportedLanguages"
          >
            <USelect
              v-model="settings.supportedLanguages"
              :items="languageOptions"
              option-attribute="label"
              value-attribute="value"
              multiple
              searchable
              placeholder="Select additional languages"
              size="lg"
            />
            <template #help>
              <span class="text-sm text-gray-500">Select all languages your organization supports</span>
            </template>
          </UFormField>

          <!-- Date Format -->
          <UFormField
            label="Date Format"
            name="dateFormat"
          >
            <USelect
              v-model="settings.dateFormat"
              :items="dateFormatOptions"
              size="lg"
            />
          </UFormField>

          <!-- Time Format -->
          <UFormField
            label="Time Format"
            name="timeFormat"
          >
            <USelect
              v-model="settings.timeFormat"
              :items="timeFormatOptions"
              size="lg"
            />
          </UFormField>
        </div>
      </UCard>

      <!-- Learning Management -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon
              name="i-heroicons-academic-cap"
              class="w-5 h-5"
            />
            <h2 class="text-xl font-semibold">
              Learning Management
            </h2>
          </div>
        </template>

        <div class="space-y-6">
          <!-- Default Course Duration -->
          <UFormField
            label="Default Course Duration (weeks)"
            name="defaultCourseDuration"
          >
            <UInput
              v-model.number="settings.defaultCourseDuration"
              type="number"
              min="1"
              max="52"
              placeholder="12"
            />
          </UFormField>

          <!-- Assessment Settings -->
          <UFormField
            label="Default Pass Grade (%)"
            name="defaultPassGrade"
          >
            <UInput
              v-model.number="settings.defaultPassGrade"
              type="number"
              min="0"
              max="100"
              placeholder="70"
            />
          </UFormField>

          <!-- Enrollment Settings -->
          <div class="space-y-4">
            <UCheckbox
              v-model="settings.allowSelfEnrollment"
              label="Allow self-enrollment for public courses"
            />
            <UCheckbox
              v-model="settings.requireApproval"
              label="Require approval for course enrollment"
            />
            <UCheckbox
              v-model="settings.enableCertificates"
              label="Enable course completion certificates"
            />
          </div>
        </div>
      </UCard>

      <!-- Communication Settings -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon
              name="i-heroicons-envelope"
              class="w-5 h-5"
            />
            <h2 class="text-xl font-semibold">
              Communication
            </h2>
          </div>
        </template>

        <div class="space-y-6">
          <!-- Contact Email -->
          <UFormField
            label="Primary Contact Email"
            name="contactEmail"
            required
          >
            <UInput
              v-model="settings.contactEmail"
              type="email"
              placeholder="contact@organization.com"
              size="lg"
            />
          </UFormField>

          <!-- Notification Settings -->
          <div class="space-y-4">
            <h3 class="font-medium text-gray-900 dark:text-white">
              Email Notifications
            </h3>
            <UCheckbox
              v-model="settings.notifyNewEnrollments"
              label="Notify administrators of new enrollments"
            />
            <UCheckbox
              v-model="settings.notifyCompletions"
              label="Notify administrators of course completions"
            />
            <UCheckbox
              v-model="settings.sendWelcomeEmails"
              label="Send welcome emails to new learners"
            />
            <UCheckbox
              v-model="settings.sendReminderEmails"
              label="Send reminder emails for incomplete courses"
            />
          </div>
        </div>
      </UCard>

      <!-- Security & Privacy -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon
              name="i-heroicons-shield-check"
              class="w-5 h-5"
            />
            <h2 class="text-xl font-semibold">
              Security & Privacy
            </h2>
          </div>
        </template>

        <div class="space-y-6">
          <!-- Data Retention -->
          <UFormField
            label="Data Retention Period (months)"
            name="dataRetentionPeriod"
          >
            <UInput
              v-model.number="settings.dataRetentionPeriod"
              type="number"
              min="6"
              max="120"
              placeholder="36"
            />
            <template #help>
              <span class="text-sm text-gray-500">How long to retain learner data after account deletion</span>
            </template>
          </UFormField>

          <!-- Privacy Settings -->
          <div class="space-y-4">
            <UCheckbox
              v-model="settings.allowDataExport"
              label="Allow learners to export their data"
            />
            <UCheckbox
              v-model="settings.enableTwoFactor"
              label="Require two-factor authentication for administrators"
            />
            <UCheckbox
              v-model="settings.enableAuditLog"
              label="Enable audit logging for administrative actions"
            />
          </div>
        </div>
      </UCard>

      <!-- Action Buttons -->
      <div class="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
        <UButton
          variant="outline"
          color="neutral"
          :loading="isResetting"
          @click="resetSettings"
        >
          Reset to Defaults
        </UButton>

        <div class="flex gap-3">
          <UButton
            variant="outline"
            @click="previewSettings"
          >
            Preview Changes
          </UButton>
          <UButton
            type="submit"
            :loading="isSaving"
            size="lg"
          >
            Save Settings
          </UButton>
        </div>
      </div>
    </form>
  </NuxtLayout>
</template>
