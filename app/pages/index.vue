<i18n src="./index.json"></i18n>

<script setup lang="ts">
definePageMeta({
  auth: false,
  layout: false
})

const { t } = useI18n()
const localePath = useLocalePath()
const runtimeConfig = useRuntimeConfig()

const title = `${t('global.appName')}: ${t('home.slogan')}`
const desc = t('home.slogan')

useSeoMeta({
  title,
  description: desc,
  // Facebook
  ogTitle: title,
  ogDescription: desc,
  ogImage: '/screenshots/home.webp',
  // twitter
  twitterTitle: title,
  twitterDescription: desc,
  twitterImage: '/screenshots/home.webp'
})
</script>

<template>
  <NuxtLayout name="default">
    <template #nav-center>
      <SiteNavigation
        mode="desktop"
        class="hidden sm:flex"
      />
    </template>
    <template #nav-right>
      <div class="flex items-center gap-2">
        <UserNavigation />
        <SiteNavigation
          mode="mobile"
          class="flex sm:hidden"
        />
      </div>
    </template>
    <div class="pt-16">
      <div class="absolute inset-0 bg-gradient-to-b from-emerald-50 to-white dark:from-gray-900 dark:to-gray-800" />
      <div class="absolute inset-0">
        <div class="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 blur-3xl opacity-50" />
        <div class="absolute top-0 ltr:left-0 rtl:right-0 w-[500px] h-[500px] bg-teal-500/20 rounded-full blur-3xl -ml-32 -mt-32 opacity-30" />
      </div>
      <!-- Hero Section -->
      <section class="relative overflow-hidden">
        <UContainer class="relative py-24">
          <div class="text-center">
            <h1 class="text-4xl font-bold tracking-tight sm:text-7xl mb-6">
              {{ t('global.appName') }}
            </h1>
            <p class="text-lg text-gray-600 dark:text-gray-400 mb-8">
              {{ t('home.slogan') }}
            </p>
            <div class="flex gap-4 justify-center">
              <UButton
                :to="localePath('/signin')"
                color="primary"
                size="lg"
              >
                {{ t('home.getStarted') }}
              </UButton>
              <UButton
                :to="runtimeConfig.public.appRepo"
                target="_blank"
                color="neutral"
                variant="outline"
                size="lg"
                icon="i-simple-icons-github"
              >
                {{ t('home.viewOnGithub') }}
              </UButton>
            </div>
          </div>
        </UContainer>
      </section>
    </div>
  </NuxtLayout>
</template>
