<script lang="ts" setup>
const { t } = useI18n()

// Zod locale configuration
const { locale } = useI18n()

const updateZodLocale = (newLocale: string) => {
  const localeKey = newLocale.replace('-', '') as keyof typeof zodLocales
  if (z.locales[localeKey]) {
    z.config(z.locales[localeKey]())
  } else {
    console.warn(`Zod locale "${localeKey}" not found, falling back to English.`)
    z.config(z.locales.en())
  }
}

watchEffect(() => {
  updateZodLocale(locale.value)
})

useHead({
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
</script>

<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
