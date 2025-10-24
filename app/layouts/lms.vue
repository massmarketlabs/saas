<script setup lang="ts">
import DefaultLayout from './default.vue'

const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

const id = route.params.id
const nav = [
  {
    label: 'Intervention Home',
    to: `/intervention/${id}`
  },
  {
    label: 'Content',
    to: `/intervention/${id}/content`
  },
  {
    label: 'Classlist',
    to: `/intervention/${id}/classlist`
  },
  {
    label: 'Grades',
    to: `/intervention/${id}/grades`
  },
  {
    label: 'Class Progress',
    to: `/intervention/${id}/progress`
  }
]
</script>

<template>
  <DefaultLayout>
    <template #nav-right>
      <SiteNavigation
        :t="t"
        :locale-path="localePath"
      />
    </template>
    <template #default>
      <div
        v-if="id"
        class="bg-accented w-full h-16 fixed"
      >
        <UContainer class="h-full content-center space-x-4">
          <UNavigationMenu
            :items="nav"
            variant="link"
          />
        </UContainer>
      </div>
      <div
        :class="{
          'pt-16': id
        }"
      >
        <slot name="default" />
      </div>
    </template>
  </DefaultLayout>
</template>
