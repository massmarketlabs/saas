<script setup lang="ts">
definePageMeta({
  layout: false
})
const { t } = useI18n()
const localePath = useLocalePath()
const { user } = useAuth()
const orgStore = useOrganizationStore()
await orgStore.fetchOrganizations()

const menuItems = [{
  label: 'Dashboard',
  to: localePath(`/${orgStore.myOrganization?.slug}/intervention-manager/dashboard`),
  icon: 'i-lucide-layout-dashboard'
}, {
  label: 'Calendar',
  to: localePath(`/${orgStore.myOrganization?.slug}/intervention-manager/calendar`),
  icon: 'i-lucide-calendar'
}, {
  label: 'Help',
  icon: 'material-symbols:contact-support-rounded',
  children: [
    {
      label: 'Video Tutorials',
      to: localePath(`/${orgStore.myOrganization?.slug}/intervention-manager/help/tutorial`),
      icon: 'material-symbols:auto-videocam-outline-sharp'
    },
    {
      label: 'Documentation',
      to: localePath(`/${orgStore.myOrganization?.slug}/intervention-manager/help/docs`),
      icon: 'material-symbols:docs'
    },
    {
      label: 'Community',
      to: localePath(`/${orgStore.myOrganization?.slug}/intervention-manager/help/community`),
      icon: 'iconoir:community'
    },
    {
      label: 'System Check',
      to: localePath(`/${orgStore.myOrganization?.slug}/intervention-manager/help/system`),
      icon: 'eos-icons:system-ok-outlined'
    }
  ]
}, { slot: 'admin' }] satisfies NavigationMenuItem[]
</script>

<template>
  <NuxtLayout name="default">
    <template #nav-right>
      <UNavigationMenu
        orientation="horizontal"
        :items="menuItems"
      >
        <template #admin>
          <UButton
            v-if="orgStore.myOrganization && user?.role == 'admin'"
            variant="outline"
            color="neutral"
            class="flex items-center gap-2"
            :to="localePath(`/${orgStore.myOrganization.slug}/admin/dashboard`)"
          >
            {{ t('global.nav.admin') }}
          </UButton>
        </template>
      </UNavigationMenu>
    </template>
    <slot />
  </NuxtLayout>
</template>
