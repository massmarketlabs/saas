<script setup lang="ts">
definePageMeta({
  layout: false
})

const route = useRoute()

const id = route.params.id as string

const active = ref('0')

const { data, refresh } = await useFetch(`/api/lms/intervention/${id as ':id'}`, { method: 'post' })

useHead({
  title: data.value?.name || ''
})
</script>

<template>
  <NuxtLayout name="lms">
    <UContainer>
      <!-- Header Section -->
      <div class="flex flex-col gap-4 border-b border-gray-200 dark:border-gray-800 mb-6">
        <div class="flex flex-col md:flex-row justify-between md:items-center">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
              {{ data?.name }}
            </h1>
            <p class="text-gray-600 dark:text-gray-400 text-sm mt-1">
              Term: <span class="font-semibold">{{ data?.term?.name }}</span> •
              Instructor: <span class="font-semibold">{{ data?.primary_instructor?.name }}</span>
            </p>
          </div>
          <UBadge
            v-if="data?.status"
            :color="data.status === 'active' ? 'success' : 'error'"
            size="lg"
            class="mt-3 md:mt-0"
          >
            {{ data.status.charAt(0).toUpperCase() + data.status.slice(1) }}
          </UBadge>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700 dark:text-gray-300">
          <UCard class="p-4">
            <p class="font-semibold">
              Duration
            </p>
            <p>
              {{ new Date(data?.term.start_date || '').toLocaleDateString() }} →
              {{ new Date(data?.term.end_date || '').toLocaleDateString() }}
            </p>
          </UCard>
          <UCard class="p-4">
            <p class="font-semibold">
              Room
            </p>
            <p>{{ data?.room }}</p>
          </UCard>
          <UCard class="p-4">
            <p class="font-semibold">
              Credits
            </p>
            <p>{{ data?.credits }}</p>
          </UCard>
        </div>

        <p class="text-gray-700 dark:text-gray-300 leading-relaxed mt-2">
          {{ data?.description }}
        </p>
      </div>
      <GridTwoColumn>
        <template #left>
          <LandingAnnouncements
            :id="id"
            :data="data"
            @refresh="refresh"
          />
        </template>

        <template #right>
          <UCard>
            <template #header>
              <div class="flex items-center gap-2">
                <icon
                  name="material-symbols-light:calendar-month-outline"
                  class="w-5 h-5 text-primary"
                />
                <span class="font-bold text-xl">Calendar</span>
              </div>
            </template>

            <UAccordion
              v-model="active"
              :items="[{ slot: 'calendar' as const, label: 'Calendar', }, { slot: 'events' as const, label: 'Upcoming Events' }]"
            >
              <template #calendar>
                <UCalendar />
              </template>
              <template #events>
                <span> No events found</span>
              </template>
            </UAccordion>
          </UCard>
        </template>
      </GridTwoColumn>
    </UContainer>
  </NuxtLayout>
</template>
