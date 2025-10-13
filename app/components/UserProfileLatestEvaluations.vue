<script setup lang="ts">
const props = defineProps<{ getGradeColor: (grade: string) => string }>()

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
              :class="props.getGradeColor(evaluation.grade)"
            >
              {{ evaluation.grade }}
            </div>
            <p class="text-xs text-gray-500">
              {{ formatDate(new Date(evaluation.date)) }}
            </p>
          </div>
        </div>
        <p class="text-sm text-gray-500">
          {{ evaluation.comments }}
        </p>
      </div>
    </div>
  </UCard>
</template>
