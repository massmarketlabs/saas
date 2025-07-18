<script lang="ts" setup>
import * as locales from '@nuxt/ui/locale'

// Zod locale configuration
const { t, locale } = useI18n()

const lang = computed(() => locales[locale.value].code)
const dir = computed(() => locales[locale.value].dir)

const updateZodLocale = (newLocale: string) => {
  const localeKey = newLocale.replace('-', '') as keyof typeof zodLocales
  if (z.locales[localeKey]) {
    z.config(z.locales[localeKey]())
  } else {
    console.warn(`Zod locale "${String(localeKey)}" not found, falling back to English.`)
    z.config(z.locales.en())
  }
}

watchEffect(() => {
  updateZodLocale(locale.value)
})

useHead({
  htmlAttrs: {
    lang,
    dir
  },
  titleTemplate: (title) => {
    if (title) {
      if (title.includes(t('global.appName'))) {
        return title
      } else {
        return `${title} | ${t('global.appName')}`
      }
    } else {
      return t('global.appName')
    }
  }
})
useSeoMeta({
  ogSiteName: t('global.appName')
})
const { start } = useLoadingIndicator({
  duration: 2000,
  throttle: 200,
  estimatedProgress: (duration, elapsed) => (2 / Math.PI * 100) * Math.atan(elapsed / duration * 100 / 50)

})

if (import.meta.client) {
  start({ force: true })
}
</script>

<template>
  <UApp :locale="locales[locale]">
    <NuxtLoadingIndicator />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
