<script setup lang="ts">
import type { LocalePathFunction } from '#i18n'
import { getMenuInterventionManager } from '~/layouts/menu-intervention-manager'

const props = defineProps<{ t: TranFunction, localePath: LocalePathFunction }>()
const menuItems = getMenuInterventionManager(props.t, props.localePath)
</script>

<template>
  <div class="flex items-center gap-2">
    <UNavigationMenu
      orientation="horizontal"
      :items="menuItems"
      variant="link"
    />
    <UserNavigation />
  </div>
</template>
