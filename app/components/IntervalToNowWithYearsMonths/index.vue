<script setup lang="ts">
import { intervalToDuration } from 'date-fns'

const props = defineProps<{ start: string }>()
const duration = computed(() => intervalToDuration({ start: props.start, end: new Date() }))
</script>

<template>
  <template v-if="duration.years">
    {{ duration.years }} Years
  </template>
  <template v-if="duration.months">
    {{ duration.months }} Months
  </template>
</template>
