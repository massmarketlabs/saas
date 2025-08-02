<script setup lang="ts">
definePageMeta({
  layout: false,
  auth: {
    only: 'user'
  }
})
const localePath = useLocalePath()

const menuItems = [{
  label: 'Dashboard',
  to: localePath(`/`),
  icon: 'i-lucide-layout-dashboard'
}, {
  label: 'Help',
  icon: 'material-symbols:contact-support-rounded',
  children: [
    {
      label: 'Video Tutorials',
      to: localePath(`/help/tutorial`),
      icon: 'material-symbols:auto-videocam-outline-sharp'
    },
    {
      label: 'Documentation',
      to: localePath(`/help/docs`),
      icon: 'material-symbols:docs'
    },
    {
      label: 'Community',
      to: localePath(`/help/community`),
      icon: 'iconoir:community'
    },
    {
      label: 'System Check',
      to: localePath(`/help/system`),
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
