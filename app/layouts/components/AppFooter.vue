<script lang="ts" setup>
const runtimeConfig = useRuntimeConfig()
</script>

<template>
  <footer class="w-full h-26 sm:h-16 border-t border-gray-200 dark:border-gray-800 py-4 z-1">
    <div class="container mx-auto px-4">
      <div class="flex flex-col md:flex-row justify-between items-center gap-4">
        <div class="flex items-center space-x-2">
          <!-- <UIcon name="i-lucide-code" /> -->
          <Logo class="w-16 h-16" />
          <USeparator
            orientation="vertical"
            class="hidden md:block"
          />
          <span class="text-sm text-gray-500 dark:text-gray-400">
            © {{ new Date().getFullYear() }} All rights reserved
          </span>
        </div>

        <div class="flex items-center space-x-4">
          <LocaleToggler />
          <ClientOnly>
            <ColorModeToggler />
          </ClientOnly>
          <UButton
            icon="i-simple-icons-github"
            variant="ghost"
            color="neutral"
            :href="runtimeConfig.public.appRepo"
            target="_blank"
            aria-label="Github"
            rel="noopener noreferrer"
          />
        </div>
      </div>
    </div>
  </footer>
</template>
