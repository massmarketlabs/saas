<script lang="ts" setup>
import AppFooter from './components/AppFooter.vue'
import AppNavbar from './components/AppNavbar.vue'

defineSlots<{
  'nav-center': () => any
  'nav-right': () => any
  'default': () => any
}>()

const i18nHead = useLocaleHead()
useHead(() => ({
  link: [...(i18nHead.value.link || [])]
}))
</script>

<template>
  <div class="min-h-screen flex flex-col items-center relative">
    <AppNavbar>
      <template #center>
        <slot name="nav-center" />
      </template>
      <template #right>
        <slot name="nav-right" />
      </template>
    </AppNavbar>
    <div class="pt-16 flex-1 w-full">
      <slot />
    </div>
    <AppFooter />
  </div>
</template>
