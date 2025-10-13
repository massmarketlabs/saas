<script setup lang="ts">
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
</script>

<template>
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
</template>
