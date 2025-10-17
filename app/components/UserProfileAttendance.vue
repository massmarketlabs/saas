<script setup lang="ts">
const props = defineProps<{ userId: string }>()

const { data } = await useFetch(`/api/admin/attendance/${props.userId as ':user_id'}`, { method: 'post' })

const getColor = (status: string) => {
  return status === 'present'
    ? 'success'
    : status === 'absent'
      ? 'error'
      : status === 'untracked' ? 'info' : 'warning'
}
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
            {{ data?.attendanceStats.present }} Present
          </UBadge>
          <UBadge
            color="error"
            variant="subtle"
          >
            {{ data?.attendanceStats.absent }} Absent
          </UBadge>
          <UBadge
            color="info"
            variant="subtle"
          >
            {{ data?.attendanceStats.untracked }} Untracked
          </UBadge>
          <UBadge
            color="warning"
            variant="subtle"
          >
            {{ data?.attendanceStats.late }} Late
          </UBadge>
        </div>
      </div>
    </template>

    <div class="space-y-4">
      <!-- Attendance Summary -->
      <div class="grid grid-cols-3 gap-4 p-4 rounded-lg">
        <div class="text-center">
          <div class="text-2xl font-bold text-green-600">
            {{ data?.attendanceStats.attendanceRate }}%
          </div>
          <div class="text-xs text-gray-500">
            Attendance Rate
          </div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-blue-600">
            {{ data?.attendanceStats.totalDays }}
          </div>
          <div class="text-xs text-gray-500">
            Total Days
          </div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-purple-600">
            {{ data?.attendanceStats.streak }}
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
            v-for="record in data?.attendanceHistory"
            :key="record.attendance.id"
            class="flex justify-between items-center p-3 rounded-lg bg-accented"
          >
            <div>
              <p class="font-medium">
                {{ formatDate(new Date(record.attendance.scheduled_date)) }}
              </p>
              <p class="text-sm text-gray-500">
                {{ record.interventions.name }}
              </p>
            </div>
            <div class="text-right">
              <UBadge
                :color="getColor(record.attendance.state)"
                variant="subtle"
              >
                {{ record.attendance.state }}
              </UBadge>
              <p
                v-if="record.attendance.note"
                class="text-xs text-gray-500 mt-1"
              >
                {{ record.attendance.note }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>
