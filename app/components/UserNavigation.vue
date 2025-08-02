<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

const localePath = useLocalePath()
const { t } = useI18n()
const { user, loggedIn, signOut } = useAuth()

const orgSlug = computed(() => `/admin/dashboard`)
const profileMenuItems: DropdownMenuItem[] = [
  {
    label: t('global.auth.profile'),
    icon: 'i-lucide-user',
    to: localePath('/profile')
  },
  {
    label: t('global.auth.signOut'),
    icon: 'i-lucide-log-out',
    onSelect: async () => await signOut({ redirectTo: localePath('/') })
  }
]
</script>

<template>
  <template v-if="loggedIn">
    <UDropdownMenu
      :items="profileMenuItems"
    >
      <UButton
        variant="ghost"
        color="neutral"
        class="flex items-center gap-2"
      >
        <UAvatar
          v-if="user?.image"
          :src="user.image"
          :alt="user.name"
          size="sm"
        />
        <span>
          {{ user?.name }}

        </span>
        <!-- <UBadge
          label="Pro"
        /> -->
      </UButton>
    </UDropdownMenu>
    <UButton
      v-if="user?.role === 'admin'"
      variant="outline"
      color="neutral"
      class="flex items-center gap-2"
      :to="localePath(orgSlug)"
    >
      {{ t('global.nav.admin') }}
    </UButton>
  </template>
  <template v-else>
    <UButton
      :to="localePath('/signin')"
      variant="outline"
    >
      {{ t('global.auth.signIn') }}
    </UButton>
  </template>
</template>
