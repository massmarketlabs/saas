<i18n src="../i18n.json"></i18n>

<script setup lang="ts">
definePageMeta({
  layout: false
})

const localePath = useLocalePath()
const { t } = useI18n()
const route = useRoute()
const id = route.params.id

const requestFetch = useRequestFetch()
const { data } = await useAsyncData(`program-${id}`, async () => await requestFetch(`/api/admin/programs/${id}`))

useHead({ title: `Programs | ${data.value?.name}` })
</script>

<template>
  <NuxtLayout name="admin">
    <template #navRight>
      <UButton
        :to="localePath(`/admin/dashboard`)"
        variant="outline"
        color="neutral"
        icon="i-lucide-arrow-left"
        :label="t('global.page.back')"
      />
    </template>

    <div class="space-y-6">
      <!-- Program Header Card -->
      <UCard class="border-l-2 border-l-primary">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold dark:text-white">
              {{ data?.name }}
            </h1>
            <p
              v-if="data?.description"
              class="text-gray-500 mt-1"
            >
              {{ data?.description || 'No program description' }}
            </p>
          </div>
          <template v-if="data?.is_active">
            <div class="flex flex-wrap gap-2">
              <UBadge class="inline-flex text-center items-center px-3 py-1 rounded-full text-xs font-medium">
                Active Program
              </UBadge>
            </div>
          </template>
          <template v-else>
            <UBadge
              color="error"
              class="inline-flex text-center items-center px-3 py-1 rounded-full text-xs font-medium"
            >
              Inactive Program
            </UBadge>
          </template>
        </div>
      </UCard>

      <!-- Statistics Overview -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Interventions -->
        <UCard class="shadow-sm hover:shadow-md transition-shadow">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Icon
                  name="i-lucide-activity"
                  class="text-green-600 w-4 h-4"
                />
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium">
                Interventions
              </p>
              <p class="text-2xl font-semibold text-gray-500">
                {{ data?.interventions?.length || 0 }}
              </p>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Column: Program Enrollment -->
        <div class="lg:col-span-2 space-y-6">
          <CardExpandable
            :items="[]"
            title="Active Enrollments"
          />
        </div>

        <!-- Right Column: Terms and Interventions -->
        <div class="space-y-6">
          <!-- Interventions Section -->
          <CardExpandable
            :items="data?.interventions ?? []"
            title="Interventions"
            header-icon="i-lucide-zap"
            empty-state-icon="i-lucide-zap"
            empty-state-title="No interventions available"
          >
            <template #header-actions>
              <UModal
                title="Add an Intervention"
                description="Create a new intervention for this program"
              >
                <UButton
                  size="sm"
                  icon="i-lucide-plus"
                  :label="t('global.page.create')"
                  color="primary"
                />
                <template #body>
                  <Placeholder class="h-48" />
                </template>
              </UModal>
            </template>

            <template #empty-action>
              <UButton
                icon="i-lucide-user-plus"
                label="Create an Intervention"
              />
            </template>
            <template #item="interventionItem">
              <div class="flex items-center justify-between">
                <div class="text-left flex-1 justify-start p-0 h-auto">
                  <p class="font-medium">
                    {{ interventionItem.item.name }}
                  </p>
                  <p class="font-medium text-gray-500 text-sm">
                    {{ interventionItem.item.term.name }}
                  </p>
                </div>
                <UDropdownMenu
                  :items="[
                    [
                      {
                        label: 'View',
                        icon: 'i-lucide-eye',
                        onSelect: async () => await navigateTo(`/admin/programs/${interventionItem.item.program_id}/intervention/${interventionItem.item.id}`)
                      }
                    ],
                    [
                      {
                        label: 'Delete',
                        icon: 'i-lucide-trash-2',
                        color: 'error'
                      }
                    ]
                  ]"
                >
                  <UButton
                    icon="i-lucide-more-horizontal"
                    size="xs"
                    variant="ghost"
                    square
                    class="text-white-500"
                  />
                </UDropdownMenu>
              </div>
            </template>
          </CardExpandable>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>
