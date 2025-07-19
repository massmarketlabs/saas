<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

const localePath = useLocalePath()
const { t } = useI18n()
const authClient = useAuth()
const activeOrg = authClient.client.useActiveOrganization()

const orgSlug = computed(() => `/${activeOrg.value.data?.slug}/admin/dashboard`)
const profileMenuItems: DropdownMenuItem[] = [
  {
    label: t('global.auth.profile'),
    icon: 'i-lucide-user',
    to: localePath('/profile')
  },
  {
    label: t('global.auth.signOut'),
    icon: 'i-lucide-log-out',
    onSelect: () => authClient.signOut({ redirectTo: localePath('/') })
  }
]
</script>

<template>
  <template v-if="authClient.loggedIn.value">
    <UDropdownMenu
      :items="profileMenuItems"
    >
      <UButton
        variant="ghost"
        color="neutral"
        class="flex items-center gap-2"
      >
        <UAvatar
          v-if="authClient.user?.value?.image"
          :src="authClient.user?.value?.image"
          :alt="authClient.user?.value?.name"
          size="sm"
        />
        <span>
          {{ authClient.user?.value?.name }}

        </span>
        <!-- <UBadge
          label="Pro"
        /> -->
      </UButton>
    </UDropdownMenu>
    <UButton
      v-if="activeOrg.data && authClient.user?.value?.role == 'admin'"
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
