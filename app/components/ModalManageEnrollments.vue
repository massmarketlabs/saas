<script setup lang='ts'>
const props = defineProps<{ userId: string }>()
const user_id = props.userId
const data = await useFetch(`api/admin/intervention-enrollment/${user_id as 'user_id'}`)
console.log({ data })
</script>

<template>
  <UModal
    title="Manage Enrollments"
    description="Here you can manage student enrollments in different interventions"
  >
    <UButton
      label="Modify"
      icon="i-lucide-pencil"
      size="sm"
      variant="outline"
    />
    <template #body>
      <div class="space-y-0">
        <div class="flex justify-between items-center gap-2">
          <UInput
            label="Search"
            icon="i-lucide-search"
            placeholder="Search Interventions"
            class="w-full"
          />
          <UTooltip text="This will search all interventions, not just currently active ones.">
            <UIcon
              name="material-symbols:info-outline-rounded"
              class="w-6 h-6 text-gray-500"
            />
          </UTooltip>
        </div>
        <pre>
          {{ data }}
        </pre>
      </div>
    </template>
  </UModal>
</template>
