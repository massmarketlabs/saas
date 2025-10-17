<i18n src="./i18n.json"></i18n>

<script lang="ts" setup>
definePageMeta({
  layout: false
})

const route = useRoute()
const { t } = useI18n()

const id = route.params.id as string
const { data, refresh } = await useFetch(`/api/admin/user/${id as ':id'}`, {
  key: `profile-${id as ':id'}`,
  method: 'post'
})

useHead({
  title: `Profile | ${data.value?.name}`
})

const getGradeColor = (grade: string) => {
  if (grade.startsWith('A'))
    return 'text-green-600'
  if (grade.startsWith('B'))
    return 'text-blue-600'
  if (grade.startsWith('C'))
    return 'text-yellow-600'
  if (grade.startsWith('D'))
    return 'text-orange-600'
  return 'text-red-600'
}
</script>

<template>
  <NuxtLayout name="admin">
    <div class="min-h-screen p-6">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold mb-2">
          Student Profile
        </h1>
        <p class="text-gray-500">
          Manage student information and track academic progress
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Column -->
        <div class="lg:col-span-1 space-y-6">
          <!-- Profile General Information -->
          <UserProfileInformation
            :id="id"
            :t="t"
            :data="data"
            @update-profile-information="refresh"
          />
          <!-- Emergency Contact Information -->
          <UserProfileEmergencyContact
            :id="id"
            :data="data"
            @update-emergency-contacts="refresh"
          />
          <!-- Siblings -->
          <UserProfileFamilyMembers
            :id="id"
            :data="data"
            @update-profile-sibling="refresh"
          />
        </div>

        <!-- Right Column -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Student Notes -->
          <UserProfileNotes
            :id="id"
            :data="data"
            @update-profile-notes="refresh"
          />
          <!-- Latest Evaluations -->
          <UserProfileLatestEvaluations
            :data="data"
            :get-grade-color="getGradeColor"
          />
          <!-- Enrollment Tabs -->
          <UserProfileEnrollment
            :id="id"
            :data="data"
            :get-grade-color="getGradeColor"
          />
          <!-- Attendance History -->
          <UserProfileAttendance />
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>
