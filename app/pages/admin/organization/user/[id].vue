<i18n src="./i18n.json"></i18n>

<script lang="ts" setup>
import { ref } from 'vue'

definePageMeta({
  layout: false
})

const router = useRouter()
const route = useRoute()
const { t } = useI18n()

const id = route.params.id as string
const { data, refresh } = await useFetch(`/api/admin/user/${id as ':id'}`, {
  key: `profile-${id as ':id'}`
})

useHead({
  title: `Profile | ${data.value?.name}`
})

// Siblings
const siblings = computed(() => {
  if (!data.value || !data.value?.relationship_user) {
    return []
  }

  return data.value.relationship_user.map(relationship => ({
    id: relationship.id,
    user_id: relationship.related_user_id,
    name: relationship.related_user.name,
    relationship: relationship.relationship_type,
    avatar: relationship.related_user.image,
    status: 'Active'
  }))
})

// Student Notes
const studentNotes = computed(() =>
  data.value?.beneficiary_notes.map(note => ({
    id: note.id,
    title: note.title,
    content: note.description,
    author: note.created_by.name,
    author_id: note.created_by.id,
    date: note.created_at,
    priority: note.priority
  }))
)

const latestEvaluations = ref([
  {
    id: 1,
    subject: 'Mathematics',
    type: 'Mid-term Exam',
    grade: 'B+',
    date: '2024-02-20',
    comments:
      'Good improvement in problem-solving skills. Keep up the good work!'
  },
  {
    id: 2,
    subject: 'Science',
    type: 'Lab Report',
    grade: 'A',
    date: '2024-02-18',
    comments:
      'Excellent observation skills and detailed analysis. Outstanding work!'
  },
  {
    id: 3,
    subject: 'English',
    type: 'Essay Assignment',
    grade: 'A-',
    date: '2024-02-15',
    comments:
      'Creative writing with good structure. Minor grammar improvements needed.'
  }
])

// Enrollment Data
const activeTab = computed({
  get() {
    return (route.query.enrollments as string) || 'current'
  },
  set(tab) {
    // Hash is specified here to prevent the page from scrolling to the top
    router.push({
      // path: '/components/tabs',
      query: { enrollments: tab }
      // hash: '#control-active-item'u
    })
  }
})
const interventions = computed(() => {
  if (!data.value)
    return []
  const interventions = data.value.intervention_enrollment.map(
    x => x.intervention
  )
  return interventions
})

const enrollmentTabs = ref([
  {
    key: 'current' as const,
    value: 'current' as const,
    slot: 'current' as const,
    label: 'Current Enrollments',
    data: interventions.value
      .filter(x => x.status === 'active')
      .map(intervention => ({
        id: intervention.id,
        course: intervention.name,
        startDate: intervention.start_date,
        status: 'Active',
        instructor: 'Mr. Batata',
        period: '2nd Period',
        room: 'Room 201',
        credits: 4
      }))
  },
  {
    key: 'previous' as const,
    value: 'previous' as const,
    slot: 'previous' as const,
    label: 'Previous Enrollments',
    data: interventions.value
      .filter(x => x.status !== 'active')
      .map(intervention => ({
        id: intervention.id,
        course: intervention.name,
        startDate: intervention.start_date,
        status: 'Active',
        instructor: 'Mr. Batata',
        period: '2nd Period',
        room: 'Room 201',
        credits: 4,
        finalGrade: 'A+',
        academicYear: 2025
      }))
  }
])

// Attendance Data
const attendanceStats = ref({
  present: 142,
  absent: 3,
  late: 8,
  totalDays: 153,
  attendanceRate: 93,
  streak: 12
})

const attendanceHistory = ref([
  {
    id: 1,
    date: '2024-02-20',
    course: 'Mathematics',
    status: 'Present',
    notes: null
  },
  {
    id: 2,
    date: '2024-02-20',
    course: 'Biology',
    status: 'Present',
    notes: null
  },
  {
    id: 3,
    date: '2024-02-19',
    course: 'English',
    status: 'Late',
    notes: 'Arrived 10 minutes late'
  },
  {
    id: 4,
    date: '2024-02-18',
    course: 'Mathematics',
    status: 'Absent',
    notes: 'Sick leave - parent notification'
  }
])

// Methods
const formatDate = (dateString: Date | string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

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
          <UCard class="shadow-lg border border-gray-200 rounded-xl overflow-hidden">
            <template #header>
              <div class="flex justify-between">
                <div class="flex items-center gap-3">
                  <UIcon
                    name="i-heroicons-users"
                    class="text-green-600 text-xl"
                  />
                  <h2 class="text-lg font-semibold">
                    Family Members
                  </h2>
                </div>
                <ModalCreateFamilyMember
                  :user-id="id"
                  @family-member-created="refresh"
                />
              </div>
            </template>
            <div
              v-if="siblings.length === 0"
              class="text-center my-6 space-y-2"
            >
              <Icon
                name="i-heroicons-users"
                class="text-green-600 text-xl rounded-full"
              />
              <p class="text-center text-xl font-bold text-gray-500">
                No current family members
              </p>
              <p class="text-center text-sm text-gray-500">
                Start by adding a family member
              </p>
            </div>
            <div
              v-else
              class="space-y-3"
            >
              <div
                v-for="sibling in siblings"
                :key="sibling.id"
                class="flex items-center gap-3 p-3 rounded-lg bg-accented"
              >
                <UAvatar
                  :src="sibling.avatar || undefined"
                  :alt="sibling.name"
                />
                <NuxtLink
                  :to="`/admin/organization/user/${sibling.user_id}`"
                  class="flex-1 space-y-1"
                >
                  <p class="font-medium text-sm">
                    {{ sibling.name }}
                  </p>
                  <p class="text-xs text-gray-500">
                    {{ sibling.relationship }}
                  </p>
                  <UBadge
                    :color="sibling.status === 'Active' ? 'success' : 'neutral'"
                    variant="subtle"
                    size="sm"
                  >
                    {{ sibling.status }}
                  </UBadge>
                </NuxtLink>
              </div>
            </div>
          </UCard>
        </div>

        <!-- Right Column -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Student Notes -->
          <UCard class="shadow-lg border border-gray-200 rounded-xl overflow-hidden">
            <template #header>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <UIcon
                    name="i-heroicons-document-text"
                    class="text-purple-600 text-xl"
                  />
                  <h2 class="text-lg font-semibold">
                    Notes
                  </h2>
                </div>
                <ModalCreateProfileNote
                  :beneficiary-id="id"
                  @note-added="refresh"
                />
              </div>
            </template>
            <div v-if="!studentNotes || studentNotes.length === 0">
              <div class="text-center">
                <Icon
                  name="i-heroicons-document-text"
                  class="text-purple-600 text-xl rounded-full"
                />
              </div>
              <p class="text-center text-xl font-bold text-gray-500">
                No Notes Found
              </p>
              <p class="text-center text-sm text-gray-500">
                Start by adding a note
              </p>
            </div>
            <div
              v-else
              class="space-y-4"
            >
              <div
                v-for="note in studentNotes"
                :key="note.id"
                class="p-4 rounded-lg bg-accented"
              >
                <div class="flex justify-between items-start mb-2">
                  <h4 class="font-medium">
                    {{ note.title }}
                  </h4>
                  <span class="text-xs text-gray-500">{{
                    formatDate(note.date)
                  }}</span>
                </div>
                <p class="text-sm text-gray-500 mb-2">
                  {{ note.content }}
                </p>
                <div class="flex justify-between items-center">
                  <NuxtLink :to="`/admin/organization/user/${note.author_id}`">
                    <span class="text-xs text-gray-500">By {{ note.author }}</span>
                  </NuxtLink>
                  <UBadge
                    :color="note.priority === 'High'
                      ? 'error'
                      : note.priority === 'Medium'
                        ? 'warning'
                        : 'success'
                    "
                    variant="subtle"
                    size="xs"
                  >
                    {{ note.priority }}
                  </UBadge>
                </div>
              </div>
            </div>
          </UCard>

          <!-- Latest Evaluations -->
          <UCard class="shadow-lg border border-gray-200 rounded-xl overflow-hidden">
            <template #header>
              <div class="flex items-center gap-3">
                <UIcon
                  name="i-heroicons-chart-bar"
                  class="text-orange-600 text-xl"
                />
                <h2 class="text-lg font-semibold">
                  Latest Evaluations
                </h2>
              </div>
            </template>

            <div class="space-y-4">
              <div
                v-for="evaluation in latestEvaluations"
                :key="evaluation.id"
                class="p-4 rounded-lg bg-accented"
              >
                <div class="flex justify-between items-start mb-3">
                  <div>
                    <h4 class="font-medium">
                      {{ evaluation.subject }}
                    </h4>
                    <p class="text-sm text-gray-500">
                      {{ evaluation.type }}
                    </p>
                  </div>
                  <div class="text-right">
                    <div
                      class="text-2xl font-bold"
                      :class="getGradeColor(evaluation.grade)"
                    >
                      {{ evaluation.grade }}
                    </div>
                    <p class="text-xs text-gray-500">
                      {{ formatDate(evaluation.date) }}
                    </p>
                  </div>
                </div>
                <p class="text-sm text-gray-500">
                  {{ evaluation.comments }}
                </p>
              </div>
            </div>
          </UCard>

          <!-- Enrollment Tabs -->
          <UCard class="shadow-lg border border-gray-200 rounded-xl overflow-hidden">
            <template #header>
              <div class="flex justify-between">
                <div class="flex items-center gap-3">
                  <UIcon
                    name="i-heroicons-academic-cap"
                    class="text-indigo-600 text-xl"
                  />
                  <h2 class="text-lg font-semibold">
                    Enrollments
                  </h2>
                </div>
                <ModalManageEnrollments :user-id="id" />
              </div>
            </template>

            <UTabs
              v-model="activeTab"
              :items="enrollmentTabs"
            >
              <template #current="{ item }">
                <div
                  v-if="item.data.length === 0"
                  class="text-center my-6 space-y-2"
                >
                  <Icon
                    name="i-heroicons-academic-cap"
                    class="text-indigo-600 text-xl rounded-full"
                  />
                  <p class="text-center text-xl font-bold text-gray-500">
                    No current enrollments Found
                  </p>
                  <p class="text-center text-sm text-gray-500">
                    Start by assigning user to an intervention
                  </p>
                </div>
                <div
                  v-else
                  class="space-y-4"
                >
                  <div
                    v-for="enrollment in item.data"
                    :key="enrollment.id"
                    class="p-4 rounded-lg bg-accented"
                  >
                    <div class="flex justify-between items-start mb-2">
                      <div>
                        <h4 class="font-medium">
                          {{ enrollment.course }}
                        </h4>
                        <p class="text-sm text-gray-500">
                          {{ enrollment.instructor }}
                        </p>
                      </div>
                      <UBadge
                        :color="enrollment.status === 'Active' ? 'success' : 'neutral'
                        "
                        variant="subtle"
                      >
                        {{ enrollment.status }}
                      </UBadge>
                    </div>
                    <div class="grid grid-cols-2 gap-4 text-sm text-gray-500">
                      <div>
                        <span class="font-medium">Period:</span>
                        {{ enrollment.period }}
                      </div>
                      <div>
                        <span class="font-medium">Room:</span>
                        {{ enrollment.room }}
                      </div>
                      <div>
                        <span class="font-medium">Start Date:</span>
                        {{ formatDate(String(enrollment.startDate)) }}
                      </div>
                      <div>
                        <span class="font-medium">Credits:</span>
                        {{ enrollment.credits }}
                      </div>
                    </div>
                  </div>
                </div>
              </template>

              <template #previous="{ item }">
                <div
                  v-if="item.data.length === 0"
                  class="text-center my-6 space-y-2"
                >
                  <Icon
                    name="i-heroicons-academic-cap"
                    class="text-indigo-600 text-xl rounded-full"
                  />
                  <p class="text-center text-xl font-bold text-gray-500">
                    No previous enrollments Found
                  </p>
                </div>
                <div
                  v-else
                  class="space-y-4"
                >
                  <div
                    v-for="enrollment in item.data"
                    :key="enrollment.id"
                    class="p-4 rounded-lg bg-accented"
                  >
                    <div class="flex justify-between items-start mb-2">
                      <div>
                        <h4 class="font-medium">
                          {{ enrollment.course }}
                        </h4>
                        <p class="text-sm text-gray-500">
                          {{ enrollment.instructor }}
                        </p>
                      </div>
                      <div class="text-right">
                        <UBadge
                          color="neutral"
                          variant="subtle"
                        >
                          Completed
                        </UBadge>
                        <div
                          class="text-lg font-semibold mt-1"
                          :class="getGradeColor(enrollment?.finalGrade)"
                        >
                          {{ enrollment?.finalGrade }}
                        </div>
                      </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4 text-sm text-gray-500">
                      <div>
                        <span class="font-medium">Period:</span>
                        {{ enrollment.period }}
                      </div>
                      <div>
                        <span class="font-medium">Year:</span>
                        {{ enrollment?.academicYear }}
                      </div>
                      <div>
                        <span class="font-medium">Credits Earned:</span>
                        {{ enrollment.credits }}
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </UTabs>
          </UCard>

          <!-- Attendance History -->
          <UCard class="shadow-lg border border-gray-200 rounded-xl overflow-hidden">
            <template #header>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <UIcon
                    name="i-heroicons-calendar-days"
                    class="text-teal-600 text-xl"
                  />
                  <h2 class="text-lg font-semibold">
                    Attendance History
                  </h2>
                </div>
                <div class="flex gap-2">
                  <UBadge
                    color="success"
                    variant="subtle"
                  >
                    {{ attendanceStats.present }} Present
                  </UBadge>
                  <UBadge
                    color="error"
                    variant="subtle"
                  >
                    {{ attendanceStats.absent }} Absent
                  </UBadge>
                  <UBadge
                    color="warning"
                    variant="subtle"
                  >
                    {{ attendanceStats.late }} Late
                  </UBadge>
                </div>
              </div>
            </template>

            <div class="space-y-4">
              <!-- Attendance Summary -->
              <div class="grid grid-cols-3 gap-4 p-4 rounded-lg">
                <div class="text-center">
                  <div class="text-2xl font-bold text-green-600">
                    {{ attendanceStats.attendanceRate }}%
                  </div>
                  <div class="text-xs text-gray-500">
                    Attendance Rate
                  </div>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold text-blue-600">
                    {{ attendanceStats.totalDays }}
                  </div>
                  <div class="text-xs text-gray-500">
                    Total Days
                  </div>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold text-purple-600">
                    {{ attendanceStats.streak }}
                  </div>
                  <div class="text-xs text-gray-500">
                    Current Streak
                  </div>
                </div>
              </div>

              <!-- Recent Attendance -->
              <div class="space-y-2">
                <h4 class="font-medium">
                  Recent Attendance
                </h4>
                <div class="space-y-2">
                  <div
                    v-for="record in attendanceHistory"
                    :key="record.id"
                    class="flex justify-between items-center p-3 rounded-lg bg-accented"
                  >
                    <div>
                      <p class="font-medium">
                        {{ formatDate(record.date) }}
                      </p>
                      <p class="text-sm text-gray-500">
                        {{ record.course }}
                      </p>
                    </div>
                    <div class="text-right">
                      <UBadge
                        :color="record.status === 'Present'
                          ? 'success'
                          : record.status === 'Absent'
                            ? 'error'
                            : 'warning'
                        "
                        variant="subtle"
                      >
                        {{ record.status }}
                      </UBadge>
                      <p
                        v-if="record.notes"
                        class="text-xs text-gray-500 mt-1"
                      >
                        {{ record.notes }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </UCard>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>
