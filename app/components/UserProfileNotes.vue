<script setup lang="ts">
import type { InternalApi } from 'nitropack'

const props = defineProps<{ id: string, data?: InternalApi['/api/admin/user/:id']['get'] }>()
const emits = defineEmits(['updateProfileNotes'])

const studentNotes = computed(() =>
  props.data?.beneficiary_notes.map(note => ({
    id: note.id,
    title: note.title,
    content: note.description,
    author: note.created_by.name,
    author_id: note.created_by.id,
    date: note.created_at,
    priority: note.priority
  }))
)
</script>

<template>
  <UCard class="shadow-lg border border-gray-200 rounded-xl overflow-hidden">
    <template #header>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <UIcon
            name="i-heroicons-document-text"
            class="text-purple-600 text-xl"
          />
          <h2 class="text-lg font-semibold">
            Notes
          </h2>
        </div>
        <ModalCreateProfileNote
          :beneficiary-id="id"
          @note-added="emits('updateProfileNotes')"
        />
      </div>
    </template>
    <div v-if="!studentNotes || studentNotes.length === 0">
      <div class="text-center">
        <Icon
          name="i-heroicons-document-text"
          class="text-purple-600 text-xl rounded-full"
        />
      </div>
      <p class="text-center text-xl font-bold text-gray-500">
        No Notes Found
      </p>
      <p class="text-center text-sm text-gray-500">
        Start by adding a note
      </p>
    </div>
    <div
      v-else
      class="space-y-4"
    >
      <div
        v-for="note in studentNotes"
        :key="note.id"
        class="p-4 rounded-lg bg-accented"
      >
        <div class="flex justify-between items-start mb-2">
          <h4 class="font-medium">
            {{ note.title }}
          </h4>
          <span class="text-xs text-gray-500">{{
            formatDate(new Date(note.date))
          }}</span>
        </div>
        <p class="text-sm text-gray-500 mb-2">
          {{ note.content }}
        </p>
        <div class="flex justify-between items-center">
          <NuxtLink :to="`/admin/organization/user/${note.author_id}`">
            <span class="text-xs text-gray-500">By {{ note.author }}</span>
          </NuxtLink>
          <UBadge
            :color="note.priority === 'High'
              ? 'error'
              : note.priority === 'Medium'
                ? 'warning'
                : 'success'
            "
            variant="subtle"
            size="xs"
          >
            {{ note.priority }}
          </UBadge>
        </div>
      </div>
    </div>
  </UCard>
</template>
