<script setup lang="ts">
import { DateFormatter, getLocalTimeZone, parseDate, today } from '@internationalized/date'

const df = new DateFormatter('en-US', {
  dateStyle: 'short'
})

const toCalendarDate = (value?: string | null) => {
  if (!value)
    return today(getLocalTimeZone())
  try {
    return parseDate(value)
  } catch {
    return today(getLocalTimeZone())
  }
}

const toString = (date: any) => date?.toString() || ''

const start = defineModel<string | undefined | null>('start', {
  required: true
})

const end = defineModel<string | undefined | null>('end', {
  required: true
})

const modelValue = computed({
  get: () => ({
    start: toCalendarDate(start.value),
    end: toCalendarDate(end.value)
  }),
  set: (value) => {
    start.value = toString(value.start)
    end.value = toString(value.end)
  }
})
</script>

<template>
  <UPopover>
    <UButton
      color="neutral"
      variant="subtle"
      icon="i-lucide-calendar"
    >
      <template v-if="toCalendarDate(start)">
        <template v-if="toCalendarDate(end)">
          {{ df.format(toCalendarDate(start).toDate(getLocalTimeZone())) }} - {{
            df.format(toCalendarDate(end).toDate(getLocalTimeZone())) }}
        </template>
        <template v-else>
          {{ df.format(toCalendarDate(start).toDate(getLocalTimeZone())) }}
        </template>
      </template>
      <template v-else>
        Pick a date
      </template>
    </UButton>
    <template #content>
      <UCalendar
        v-model="modelValue"
        class="p-2"
        :number-of-months="2"
        range
      />
    </template>
  </UPopover>
</template>
