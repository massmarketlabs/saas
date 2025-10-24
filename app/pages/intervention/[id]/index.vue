<script setup lang="ts">
definePageMeta({
  layout: false
})

const route = useRoute()

const id = route.params.id

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
      <div class="flex flex-col gap-4 py-6 border-b border-gray-200 dark:border-gray-800 mb-6">
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
          <UCard>
            <template #header>
              <div class="flex justify-between items-center">
                <div class="flex items-center gap-2">
                  <icon
                    name="streamline-plump:announcement-megaphone-remix"
                    class="w-5 h-5 text-primary"
                  />
                  <span class="font-bold text-xl">Announcements</span>
                </div>
                <ModalCreateAnnouncements
                  :intervention-id="id as string"
                  @change="refresh"
                />
              </div>
            </template>
            <Empty
              v-if="data?.announcements.length === 0"
              icon="streamline-plump:announcement-megaphone-remix"
              title="No announcments found"
            />
            <div
              v-else
              class="space-y-4"
            >
              <div
                v-for="announcement in data?.announcements"
                :key="announcement.id"
                class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                <!-- Header with title and date -->
                <div
                  class="bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 p-4 border-b border-gray-200 dark:border-gray-700"
                >
                  <div class="flex items-start justify-between gap-4">
                    <div class="flex-1">
                      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                        {{ announcement.title }}
                      </h3>
                      <div class="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                        <div class="flex items-center gap-1">
                          <icon
                            name="material-symbols:calendar-today"
                            class="w-4 h-4"
                          />
                          {{ formatDate(new Date(announcement.created_at || '')) }}
                        </div>
                        <div class="flex items-center gap-1">
                          <icon
                            name="material-symbols:account-circle"
                            class="w-4 h-4"
                          />
                          {{ announcement.creator.name }}
                        </div>
                      </div>
                    </div>
                    <UBadge
                      color="primary"
                      variant="soft"
                    >
                      New
                    </UBadge>
                  </div>
                </div>

                <!-- Body content -->
                <div class="p-4">
                  <p class="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {{ announcement.body }}
                  </p>
                </div>

                <!-- Footer with actions -->
                <div
                  class="bg-gray-50 dark:bg-gray-800/50 px-4 py-3 flex gap-2 border-t border-gray-200 dark:border-gray-700"
                >
                  <UButton
                    icon="material-symbols:edit"
                    color="gray"
                    variant="ghost"
                    size="sm"
                    label="Edit"
                  />
                  <UButton
                    icon="material-symbols:delete-outline"
                    color="red"
                    variant="ghost"
                    size="sm"
                    label="Delete"
                  />
                </div>
              </div>
            </div>
          </UCard>
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
