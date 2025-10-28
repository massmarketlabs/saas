<script setup lang="ts">
const active_term = ref<string>('')

// Fetch user-specific intervention terms
const { data } = await useFetch('/api/lms/intervention/my/list', {
  method: 'post',
  key: 'data:lms:my-enrollments'
})
// Convert fetched data into a usable format for tab items
const intervention_terms = computed(() => {
  if (!data.value || data.value.length === 0)
    return []
  return data.value.map(term => ({
    value: term.id,
    label: term.name
  }))
})

// Set the first term as active when loaded
onMounted(() => {
  if (!data.value || data.value.length == 0) {
    return
  }
  active_term.value = data.value?.[0]?.id ?? ''
})

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-success-100 text-success-800'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'completed':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}
</script>

<template>
  <UCard class="shadow-sm">
    <template #header>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <UIcon
            name="i-lucide-zap"
            class="w-5 h-5 text-primary"
          />
          <span class="font-bold text-xl">My Interventions</span>
        </div>
        <UButton
          size="sm"
          variant="outline"
          icon="i-lucide-external-link"
          label="View All"
        />
      </div>
    </template>
    <UEmpty
      v-if="!data || !data.length"
      title="No enrollments found"
      description="Contact your academic advisor to enroll in your first intervention"
      icon="i-lucide-zap"
    />
    <UTabs
      v-else
      v-model="active_term"
      :items="intervention_terms"
      variant="link"
    >
      <template #content>
        <div
          v-for="item in data?.filter(x => x.id === active_term)"
          :key="item.id"
          class="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <UCard
            v-for="intervention in item.interventions"
            :key="intervention.id"
            class="bg-accented rounded-lg hover:shadow-sm transition-shadow md:w-xs min-w-full"
          >
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <div>
                    <h3 class="font-medium">
                      {{ intervention.name }}
                    </h3>
                    <UTooltip :ui="{ content: 'h-full' }">
                      <template #content>
                        <div class="h-max max-w-sm">
                          <p>
                            {{ intervention.description }}
                          </p>
                        </div>
                      </template>
                      <p class="text-sm text-gray-500 line-clamp-3">
                        {{ intervention.description }}
                      </p>
                    </UTooltip>
                  </div>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize"
                  :class="getStatusColor(intervention.status)"
                >
                  {{ intervention.status }}
                </span>
                <UDropdownMenu
                  :items="[
                    [{
                      label: 'View Details',
                      icon: 'i-lucide-eye',
                      onSelect: () => {
                        navigateTo(`/intervention/${intervention.id}`)
                      }
                    }],
                    [{ label: 'Edit Session', icon: 'i-lucide-edit' }],
                    [{ label: 'View Reports', icon: 'i-lucide-bar-chart' }]
                  ]"
                >
                  <UButton
                    icon="i-lucide-more-horizontal"
                    size="sm"
                    variant="ghost"
                    square
                  />
                </UDropdownMenu>
              </div>
            </div>
            <div class="flex items-center gap-4 text-sm text-gray-500">
              <span class="flex items-center gap-1 text-sm w-full">
                <Icon
                  name="i-lucide-calendar"
                  class="w-3 h-3"
                />
                {{ new Date(intervention?.term.start_date || '')?.toLocaleDateString() }}
                -
                {{ new Date(intervention?.term.end_date || '')?.toLocaleDateString() }}
              </span>
            </div>
          </UCard>
        </div>
      </template>
    </UTabs>
  </UCard>
</template>
