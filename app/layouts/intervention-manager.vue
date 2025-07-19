<script setup lang="ts">
definePageMeta({
  layout: false
})
const localePath = useLocalePath()
const { client } = useAuth()
const activeOrganization = client.useActiveOrganization()

const menuItems = [{
  label: 'Dashboard',
  to: localePath(`/${activeOrganization.value.data?.slug}/intervention-manager/dashboard`),
  icon: 'i-lucide-layout-dashboard'
}, {
  label: 'Calendar',
  to: localePath(`/${activeOrganization.value.data?.slug}/intervention-manager/calendar`),
  icon: 'i-lucide-calendar'
}, {
  label: 'Help',
  icon: 'material-symbols:contact-support-rounded',
  children: [
    {
      label: 'Video Tutorials',
      to: localePath(`/${activeOrganization.value.data?.slug}/intervention-manager/help/tutorial`),
      icon: 'material-symbols:auto-videocam-outline-sharp'
    },
    {
      label: 'Documentation',
      to: localePath(`/${activeOrganization.value.data?.slug}/intervention-manager/help/docs`),
      icon: 'material-symbols:docs'
    },
    {
      label: 'Community',
      to: localePath(`/${activeOrganization.value.data?.slug}/intervention-manager/help/community`),
      icon: 'iconoir:community'
    },
    {
      label: 'System Check',
      to: localePath(`/${activeOrganization.value.data?.slug}/intervention-manager/help/system`),
      icon: 'eos-icons:system-ok-outlined'
    }
  ]
}, {
  slot: 'userNavigation'
}] satisfies NavigationMenuItem[]
</script>

<template>
  <NuxtLayout name="default">
    <template #nav-right>
      <UNavigationMenu
        orientation="horizontal"
        :items="menuItems"
        variant="link"
      >
        <template #userNavigation>
          <UserNavigation />
        </template>
      </UNavigationMenu>
    </template>
    <slot />
  </NuxtLayout>
</template>
