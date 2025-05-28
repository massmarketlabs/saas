<i18n src="../i18n.json"></i18n>

<script lang="ts" setup>
import type { program_enrollment, programs } from '~~/server/database/schema'

const props = defineProps<
  { programEnrollment: typeof program_enrollment.$inferSelect[] }
>()

const { t } = useI18n()

const { data, pending } = await useFetch<{ data: typeof programs.$inferSelect[] }>('/api/admin/list/programs')

function findProgram(id: string) {
  return data.value?.data.find(x => x.id === id)
}
</script>

<template>
  <div>
    <p v-if="pending">
      Loading...
    </p>
    <ul v-else>
      <li
        v-for="(enrollment) in props.programEnrollment"
        :key="enrollment.id"
      >
        <div class="flex gap-4">
          <span>
            {{ t('beneficiary.profile.nameEn.sectionLabel') }}: {{ findProgram(enrollment.program_id)?.name }}
          </span>
          <span>
            {{ t('global.page.createdAt') }}: {{ enrollment.created_at }}
          </span>
          <span>
            {{ t('global.page.updatedAt') }}: {{ enrollment.updated_at }}
          </span>
        </div>
      </li>
    </ul>
  </div>
</template>
