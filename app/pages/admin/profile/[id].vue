<!-- eslint-disable no-alert -->
<script lang="ts" setup>
import { ref } from 'vue'

definePageMeta({
  layout: false
})

const router = useRouter()
const route = useRoute()
// Profile Data
const profileData = ref({
  name: 'Emma Thompson',
  gender: 'Female',
  avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b830?w=150&h=150&fit=crop&crop=face',
  birthday: '2008-03-15',
  status: 'Active',
  studentId: 'ST2024001'
})

// Emergency Contacts
const emergencyContacts = ref([
  {
    id: 1,
    name: 'Sarah Thompson',
    relationship: 'Mother',
    phone: '(555) 123-4567',
    email: 'sarah.thompson@email.com'
  },
  {
    id: 2,
    name: 'Michael Thompson',
    relationship: 'Father',
    phone: '(555) 987-6543',
    email: 'michael.thompson@email.com'
  }
])

// Siblings
const siblings = ref([
  {
    id: 1,
    name: 'Jake Thompson',
    relationship: 'Brother',
    grade: '10',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: 2,
    name: 'Lily Thompson',
    relationship: 'Sister',
    grade: '6',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face'
  }
])

// Student Notes
const studentNotes = ref([
  {
    id: 1,
    title: 'Exceptional Performance in Science Fair',
    content: 'Emma showed outstanding creativity and scientific thinking in her volcano project. Recommended for advanced science track.',
    author: 'Mrs. Johnson',
    date: '2024-02-15',
    priority: 'High'
  },
  {
    id: 2,
    title: 'Needs Support in Mathematics',
    content: 'Student is struggling with algebraic concepts. Recommend additional tutoring sessions.',
    author: 'Mr. Davis',
    date: '2024-02-10',
    priority: 'Medium'
  }
])

// Latest Evaluations
const latestEvaluations = ref([
  {
    id: 1,
    subject: 'Mathematics',
    type: 'Mid-term Exam',
    grade: 'B+',
    date: '2024-02-20',
    comments: 'Good improvement in problem-solving skills. Keep up the good work!'
  },
  {
    id: 2,
    subject: 'Science',
    type: 'Lab Report',
    grade: 'A',
    date: '2024-02-18',
    comments: 'Excellent observation skills and detailed analysis. Outstanding work!'
  },
  {
    id: 3,
    subject: 'English',
    type: 'Essay Assignment',
    grade: 'A-',
    date: '2024-02-15',
    comments: 'Creative writing with good structure. Minor grammar improvements needed.'
  }
])

// Enrollment Data
const activeTab = computed({
  get() {
    return route.query.enrollments as string || 'current'
  },
  set(tab) {
    // Hash is specified here to prevent the page from scrolling to the top
    router.push({
      // path: '/components/tabs',
      query: { enrollments: tab }
      // hash: '#control-active-item'
    })
  }
})

const enrollmentTabs = ref([
  {
    key: 'current' as const,
    value: 'current' as const,
    slot: 'current' as const,
    label: 'Current Enrollments',
    data: [
      {
        id: 1,
        course: 'Advanced Mathematics',
        instructor: 'Mr. Davis',
        period: '2nd Period',
        room: 'Room 201',
        startDate: '2024-01-15',
        credits: 4,
        status: 'Active'
      },
      {
        id: 2,
        course: 'Biology',
        instructor: 'Mrs. Johnson',
        period: '4th Period',
        room: 'Lab 103',
        startDate: '2024-01-15',
        credits: 3,
        status: 'Active'
      },
      {
        id: 3,
        course: 'English Literature',
        instructor: 'Ms. Williams',
        period: '1st Period',
        room: 'Room 105',
        startDate: '2024-01-15',
        credits: 3,
        status: 'Active'
      }
    ]
  },
  {
    key: 'previous' as const,
    value: 'previous' as const,
    slot: 'previous' as const,
    label: 'Previous Enrollments',
    data: [
      {
        id: 4,
        course: 'Algebra I',
        instructor: 'Mr. Smith',
        period: '3rd Period',
        academicYear: '2023-2024',
        credits: 4,
        finalGrade: 'B+',
        gpaImpact: '3.3'
      },
      {
        id: 5,
        course: 'World History',
        instructor: 'Mrs. Brown',
        period: '5th Period',
        academicYear: '2023-2024',
        credits: 3,
        finalGrade: 'A',
        gpaImpact: '4.0'
      }
    ]
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

const updateAvatar = () => {
  window.alert('Avatar update functionality would be implemented here')
}

const editProfile = () => {
  window.alert('Profile editing functionality would be implemented here')
}

const addNote = () => {
  window.alert('Add note functionality would be implemented here')
}
</script>

<template>
  <NuxtLayout name="admin">
    <div class="min-h-screen p-6">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold  mb-2">
            Student Profile
          </h1>
          <p class="text-gray-600">
            Manage student information and track academic progress
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Left Column -->
          <div class="lg:col-span-1 space-y-6">
            <!-- Profile General Information -->
            <UCard class="shadow-lg border border-gray-200 rounded-xl overflow-hidden">
              <template #header>
                <div class="flex items-center gap-3">
                  <UIcon
                    name="i-heroicons-user-circle"
                    class="text-blue-600 text-xl"
                  />
                  <h2 class="text-lg font-semibold ">
                    Profile Information
                  </h2>
                </div>
              </template>

              <div class="space-y-6">
                <!-- Avatar Section -->
                <div class="flex flex-col items-center">
                  <div class="relative">
                    <UAvatar
                      :src="profileData.avatar"
                      :alt="profileData.name"
                      size="3xl"
                      class="ring-4 ring-blue-100"
                    />
                    <UButton
                      icon="i-heroicons-camera"
                      size="sm"
                      color="primary"
                      variant="solid"
                      class="absolute bottom-0 right-0 rounded-full"
                      @click="updateAvatar"
                    />
                  </div>
                  <h3 class="text-xl font-semibold  mt-3">
                    {{ profileData.name }}
                  </h3>
                  <UBadge
                    :color="profileData.status === 'Active' ? 'success' : 'error'"
                    variant="subtle"
                    class="mt-1"
                  >
                    {{ profileData.status }}
                  </UBadge>
                </div>

                <!-- Profile Details -->
                <div class="space-y-4">
                  <div class="flex justify-between items-center py-2 border-b border-gray-100">
                    <span class="text-sm font-medium text-gray-600">Gender</span>
                    <span class="text-sm ">{{ profileData.gender }}</span>
                  </div>
                  <div class="flex justify-between items-center py-2 border-b border-gray-100">
                    <span class="text-sm font-medium text-gray-600">Birthday</span>
                    <span class="text-sm ">{{ formatDate(profileData.birthday) }}</span>
                  </div>
                  <div class="flex justify-between items-center py-2">
                    <span class="text-sm font-medium text-gray-600">Student ID</span>
                    <span class="text-sm ">{{ profileData.studentId }}</span>
                  </div>
                </div>

                <UButton
                  color="primary"
                  variant="outline"
                  block
                  @click="editProfile"
                >
                  <UIcon
                    name="i-heroicons-pencil-square"
                    class="mr-2"
                  />
                  Edit Profile
                </UButton>
              </div>
            </UCard>

            <!-- Emergency Contact Information -->
            <UCard class="shadow-lg border border-gray-200 rounded-xl overflow-hidden">
              <template #header>
                <div class="flex items-center gap-3">
                  <UIcon
                    name="i-heroicons-phone"
                    class="text-red-600 text-xl"
                  />
                  <h2 class="text-lg font-semibold ">
                    Emergency Contact
                  </h2>
                </div>
              </template>

              <div class="space-y-4">
                <div
                  v-for="contact in emergencyContacts"
                  :key="contact.id"
                  class="p-4 rounded-lg"
                >
                  <div class="flex justify-between items-start mb-2">
                    <h4 class="font-medium ">
                      {{ contact.name }}
                    </h4>
                    <UBadge
                      color="primary"
                      variant="subtle"
                      size="xs"
                    >
                      {{ contact.relationship }}
                    </UBadge>
                  </div>
                  <div class="space-y-1 text-sm text-gray-600">
                    <div class="flex items-center gap-2">
                      <UIcon
                        name="i-heroicons-phone"
                        class="text-xs"
                      />
                      <span>{{ contact.phone }}</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <UIcon
                        name="i-heroicons-envelope"
                        class="text-xs"
                      />
                      <span>{{ contact.email }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </UCard>

            <!-- Siblings -->
            <UCard class="shadow-lg border border-gray-200 rounded-xl overflow-hidden">
              <template #header>
                <div class="flex items-center gap-3">
                  <UIcon
                    name="i-heroicons-users"
                    class="text-green-600 text-xl"
                  />
                  <h2 class="text-lg font-semibold ">
                    Siblings
                  </h2>
                </div>
              </template>

              <div class="space-y-3">
                <div
                  v-for="sibling in siblings"
                  :key="sibling.id"
                  class="flex items-center gap-3 p-3 rounded-lg"
                >
                  <UAvatar
                    :src="sibling.avatar"
                    :alt="sibling.name"
                    size="sm"
                  />
                  <div class="flex-1">
                    <p class="font-medium  text-sm">
                      {{ sibling.name }}
                    </p>
                    <p class="text-xs text-gray-600">
                      {{ sibling.relationship }} • Grade {{ sibling.grade }}
                    </p>
                  </div>
                  <UBadge
                    :color="sibling.status === 'Active' ? 'success' : 'neutral'"
                    variant="subtle"
                    size="xs"
                  >
                    {{ sibling.status }}
                  </UBadge>
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
                    <h2 class="text-lg font-semibold ">
                      Student Notes
                    </h2>
                  </div>
                  <UButton
                    color="neutral"
                    variant="outline"
                    size="sm"
                    @click="addNote"
                  >
                    <UIcon
                      name="i-heroicons-plus"
                      class="mr-2"
                    />
                    Add Note
                  </UButton>
                </div>
              </template>

              <div class="space-y-4">
                <div
                  v-for="note in studentNotes"
                  :key="note.id"
                  class="p-4 rounded-lg"
                >
                  <div class="flex justify-between items-start mb-2">
                    <h4 class="font-medium ">
                      {{ note.title }}
                    </h4>
                    <span class="text-xs text-gray-500">{{ formatDate(note.date) }}</span>
                  </div>
                  <p class="text-sm text-gray-700 mb-2">
                    {{ note.content }}
                  </p>
                  <div class="flex justify-between items-center">
                    <span class="text-xs text-gray-500">By {{ note.author }}</span>
                    <UBadge
                      :color="note.priority === 'High' ? 'error' : note.priority === 'Medium' ? 'warning' : 'success'"
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
                  <h2 class="text-lg font-semibold ">
                    Latest Evaluations
                  </h2>
                </div>
              </template>

              <div class="space-y-4">
                <div
                  v-for="evaluation in latestEvaluations"
                  :key="evaluation.id"
                  class="p-4 rounded-lg"
                >
                  <div class="flex justify-between items-start mb-3">
                    <div>
                      <h4 class="font-medium ">
                        {{ evaluation.subject }}
                      </h4>
                      <p class="text-sm text-gray-600">
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
                  <p class="text-sm text-gray-700">
                    {{ evaluation.comments }}
                  </p>
                </div>
              </div>
            </UCard>

            <!-- Enrollment Tabs -->
            <UCard class="shadow-lg border border-gray-200 rounded-xl overflow-hidden">
              <template #header>
                <div class="flex items-center gap-3">
                  <UIcon
                    name="i-heroicons-academic-cap"
                    class="text-indigo-600 text-xl"
                  />
                  <h2 class="text-lg font-semibold ">
                    Enrollments
                  </h2>
                </div>
              </template>

              <UTabs
                v-model="activeTab"
                :items="enrollmentTabs"
              >
                <template #current="{ item }">
                  <div class="space-y-4">
                    <div
                      v-for="enrollment in item.data"
                      :key="enrollment.id"
                      class="p-4 rounded-lg"
                    >
                      <div class="flex justify-between items-start mb-2">
                        <div>
                          <h4 class="font-medium ">
                            {{ enrollment.course }}
                          </h4>
                          <p class="text-sm text-gray-600">
                            {{ enrollment.instructor }}
                          </p>
                        </div>
                        <UBadge
                          :color="enrollment.status === 'Active' ? 'success' : 'neutral'"
                          variant="subtle"
                        >
                          {{ enrollment.status }}
                        </UBadge>
                      </div>
                      <div class="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <span class="font-medium">Period:</span> {{ enrollment.period }}
                        </div>
                        <div>
                          <span class="font-medium">Room:</span> {{ enrollment.room }}
                        </div>
                        <div>
                          <span class="font-medium">Start Date:</span> {{ formatDate(enrollment.startDate) }}
                        </div>
                        <div>
                          <span class="font-medium">Credits:</span> {{ enrollment.credits }}
                        </div>
                      </div>
                    </div>
                  </div>
                </template>

                <template #previous="{ item }">
                  <div class="space-y-4">
                    <div
                      v-for="enrollment in item.data"
                      :key="enrollment.id"
                      class="p-4 rounded-lg"
                    >
                      <div class="flex justify-between items-start mb-2">
                        <div>
                          <h4 class="font-medium ">
                            {{ enrollment.course }}
                          </h4>
                          <p class="text-sm text-gray-600">
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
                      <div class="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <span class="font-medium">Period:</span> {{ enrollment.period }}
                        </div>
                        <div>
                          <span class="font-medium">Year:</span> {{ enrollment?.academicYear }}
                        </div>
                        <div>
                          <span class="font-medium">Credits Earned:</span> {{ enrollment.credits }}
                        </div>
                        <div>
                          <span class="font-medium">GPA Impact:</span> {{ enrollment?.gpaImpact }}
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
                    <h2 class="text-lg font-semibold ">
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
                    <div class="text-xs text-gray-600">
                      Attendance Rate
                    </div>
                  </div>
                  <div class="text-center">
                    <div class="text-2xl font-bold text-blue-600">
                      {{ attendanceStats.totalDays }}
                    </div>
                    <div class="text-xs text-gray-600">
                      Total Days
                    </div>
                  </div>
                  <div class="text-center">
                    <div class="text-2xl font-bold text-purple-600">
                      {{ attendanceStats.streak }}
                    </div>
                    <div class="text-xs text-gray-600">
                      Current Streak
                    </div>
                  </div>
                </div>

                <!-- Recent Attendance -->
                <div class="space-y-2">
                  <h4 class="font-medium ">
                    Recent Attendance
                  </h4>
                  <div class="space-y-2">
                    <div
                      v-for="record in attendanceHistory"
                      :key="record.id"
                      class="flex justify-between items-center p-3 rounded-lg"
                    >
                      <div>
                        <p class="font-medium ">
                          {{ formatDate(record.date) }}
                        </p>
                        <p class="text-sm text-gray-600">
                          {{ record.course }}
                        </p>
                      </div>
                      <div class="text-right">
                        <UBadge
                          :color="record.status === 'Present' ? 'success' : record.status === 'Absent' ? 'error' : 'warning'"
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
    </div>
  </NuxtLayout>
</template>
