<script setup lang="ts">
const programStore = useProgramStore()
const { state, schema } = storeToRefs(programStore)
const { onSubmit } = programStore
</script>

<template>
  <UModal
    title="Create a Program"
    description="Consectetur non sit labore nostrud consequat dolor aliquip ad consequat duis."
  >
    <UButton
      icon="i-lucide-plus"
      class="w-full justify-center"
      label="Add"
    />
    <template #body>
      <UForm
        :state="state"
        :schema="schema"
        class="gap-4 flex flex-col w-60"
        @submit="onSubmit"
      >
        <UFormField
          label="Name"
          name="name"
        >
          <UInput
            v-model="state.name"
            placeholder="Program Name"
          />
        </UFormField>
        <div>
          <UButton type="submit">
            Submit
          </UButton>
        </div>
      </UForm>
    </template>
  </UModal>
</template>
