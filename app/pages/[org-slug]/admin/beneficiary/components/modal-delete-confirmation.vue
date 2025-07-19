<script setup lang="ts">
import type { beneficiary } from '~~/server/database/schema'

interface Props {
  toDeleteBeneficiary: typeof beneficiary.$inferSelect | null
  refresh: () => void
  closeDeleteModal: () => void
}

const { toDeleteBeneficiary, refresh, closeDeleteModal } = defineProps<Props>()
const toast = useToast()
const deleteLoading = ref(false)

async function handleDelete() {
  try {
    deleteLoading.value = true
    const resp = await $fetch('/api/admin/beneficiary', { method: 'DELETE', body: { id: toDeleteBeneficiary?.id } })

    if (resp.length) {
      toast.add({ color: 'success', title: `Successfully deleted ${resp[0]?.id}` })
      closeDeleteModal()
      refresh()
    }
    // deleteLoading.value = false
  } catch (error) {
    console.error(error)
    // deleteLoading.value = false
  } finally {
    deleteLoading.value = false
  }
}
</script>

<template>
  <UModal
    :open="!!toDeleteBeneficiary"
    title="Permanently Delete Beneficiary"
    :description="`Beneficiary: ${toDeleteBeneficiary?.first_name_en} ${toDeleteBeneficiary?.last_name_en}`"
    @update:open="closeDeleteModal"
  >
    <template #body>
      <span> This will be permanent and all data associated with this beneficiary will be lost for ever.</span>
    </template>
    <template #footer>
      <div class="flex gap-2">
        <UButton
          variant="outline"
          :disabled="deleteLoading"
          @click="closeDeleteModal"
        >
          Cancel
        </UButton>
        <UButton
          color="error"
          :disabled="deleteLoading"
          :loading="deleteLoading"
          @click="handleDelete"
        >
          Delete
        </UButton>
      </div>
    </template>
  </UModal>
</template>
