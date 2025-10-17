<script setup lang="ts">
import type { InternalApi } from 'nitropack'

const props = defineProps<{ data?: InternalApi['/api/admin/user/:id']['post'], getGradeColor: (grade: string) => string }>()
</script>

<template>
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
      <div v-if="!data || !data.submissions || data.submissions.length === 0">
        <div class="text-center">
          <Icon
            name="i-heroicons-chart-bar"
            class="text-orange-600 text-xl rounded-full"
          />
        </div>
        <p class="text-center text-xl font-bold text-gray-500">
          No Recent Evaluations
        </p>
        <p class="text-center text-sm text-gray-500">
          Go to instructor class manager tool to make changes
        </p>
      </div>
      <div
        v-for="submission in data.submissions"
        v-else
        :key="submission.id"
        class="p-4 rounded-lg bg-accented"
      >
        <div class="flex justify-between items-start mb-3">
          <div>
            <h4 class="font-medium">
              {{ submission.assignment.intervention.name }}
            </h4>
            <p class="text-sm text-gray-500">
              {{ submission.assignment.type }}
            </p>
          </div>
          <div
            v-if="submission.evaluations?.[0]"
            class="text-right"
          >
            <div
              class="text-2xl font-bold"
              :class="props.getGradeColor(submission.evaluations?.[0]?.letter_grade || 'F')"
            >
              {{ submission.evaluations?.[0]?.letter_grade }} ({{ submission.evaluations?.[0]?.grade }}%)
            </div>
            <p class="text-xs text-gray-500">
              {{ formatDate(new Date(submission.evaluations?.[0]?.created_at || '')) }}
            </p>
          </div>
          <div
            v-else
            class="text-right"
          >
            <div class="text-sm font-light text-gray-500">
              Not Graded
            </div>
          </div>
        </div>
        <p class="text-sm text-gray-500">
          {{ submission.evaluations?.[0]?.comment }}
        </p>
      </div>
    </div>
  </UCard>
</template>
