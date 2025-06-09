<script setup lang="ts">
const localePath = useLocalePath()
</script>

<template>
  <NuxtLayout name="default">
    <template #nav-center>
      <UNavigationMenu orientation="horizontal" :items="[{
        label: 'Dashboard',
        to: localePath('/intervention-manager/dashboard'),
        icon: 'i-lucide-layout-dashboard',
      }, {
        label: 'Calendar',
        to: localePath('/intervention-manager/calendar'),
        icon: 'i-lucide-calendar'
      },
      {
        label: 'Help',
        icon: 'material-symbols:contact-support-rounded',
        children: [
          {
            label: 'Video Tutorials',
            to: localePath('/intervention-manager/help/tutorial'),
            icon: 'material-symbols:auto-videocam-outline-sharp'
          }, {
            label: 'Documentation',
            to: localePath('/intervention-manager/help/docs'),
            icon: 'material-symbols:docs'
          },
          {
            label: 'Community',
            to: localePath('/intervention-manager/help/community'),
            icon: 'iconoir:community'
          },
          {
            label: 'System Check',
            to: localePath('/intervention-manager/help/system'),
            icon: 'eos-icons:system-ok-outlined'
          },
        ]
      }]" />
    </template>
    <slot />
  </NuxtLayout>
</template>
