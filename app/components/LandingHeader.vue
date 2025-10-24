<script setup lang="ts">
const { user } = useAuth()
const { t } = useI18n()
</script>

<template>
  <UCard class="border-l-2 border-l-primary">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
          <Icon
            name="i-lucide-user"
            class="w-6 h-6 text-primary-600"
          />
        </div>
        <div>
          <h1 class="text-2xl font-bold dark:text-white">
            Welcome back, {{ user?.name }}
          </h1>
          <p class="text-gray-500 mt-1">
            {{ t(`roles.${user?.role}`) }} Dashboard • {{ new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }) }}
          </p>
        </div>
      </div>
      <div class="flex gap-2">
        <UButton
          icon="i-lucide-bell"
          variant="outline"
          size="sm"
        />
        <UButton
          icon="i-lucide-settings"
          variant="outline"
          size="sm"
        />
      </div>
    </div>
  </UCard>
</template>
