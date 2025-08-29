<!-- components/DatePicker.vue -->
<script setup lang="ts">
import type { ZonedDateTime } from '@internationalized/date'
import { DateFormatter } from '@internationalized/date'

const df = new DateFormatter('en-US', {
  dateStyle: 'medium'
})

const modelValue = defineModel<ZonedDateTime | null>({
  default: null
})
</script>

<template>
  <UPopover>
    <UButton
      variant="outline"
      color="neutral"
      icon="i-lucide-calendar"
    >
      {{ modelValue ? df.format(modelValue.toDate()) : 'Select a date' }}
    </UButton>
    <template #content>
      <UCalendar
        v-model="modelValue"
        class="p-2"
        :year-controls="true"
      />
    </template>
  </UPopover>
</template>
