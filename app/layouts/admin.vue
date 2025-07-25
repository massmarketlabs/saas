<!-- app/layouts/admin.vue -->
<i18n src="./menu/i18n.json"></i18n>

<script setup lang="ts">
import { useOrganizationStore } from '~/stores/useOrganizationStore'
import CreateProgramModal from './components/CreateProgramModal.vue'
import SearchPalette from './components/SearchPalette.vue'
import { getMenus } from './menu'

const isCollapsed = ref(false)

const { user, signOut } = useAuth()

const router = useRouter()
const route = useRoute()
const orgStore = useOrganizationStore()
await orgStore.fetchOrganizations()

const localePath = useLocalePath()

const { t } = useI18n()

defineShortcuts({
  'g-1': () => router.push(localePath(`${orgStore.myOrganization?.slug}/admin/dashboard`)),
  'g-2': () => router.push(localePath(`${orgStore.myOrganization?.slug}/admin/user`)),
  'g-3': () => router.push(localePath(`${orgStore.myOrganization?.slug}/admin/donors`))
})

const pathNameItemMap: StringDict<NavigationMenuItem> = {}
const pathNameParentMap: StringDict<NavigationMenuItem | undefined> = {}

const programStore = useProgramStore()
await programStore.fetchPrograms()

const { programs } = storeToRefs(programStore)
const menus = computed(() => getMenus(t, localePath, programs.value, orgStore.myOrganization?.slug))
const menuIterator = (menus: NavigationMenuItem[], parent?: NavigationMenuItem) => {
  for (const menu of menus) {
    const to = `${menu.to}`
    pathNameItemMap[to] = menu!
    pathNameParentMap[to] = parent
    if (menu.to == route.path) {
      if (pathNameParentMap[to]) {
        pathNameParentMap[to].defaultOpen = true
      }
    }
    if (menu.children) {
      menuIterator(menu.children, menu)
    }
  }
}
menus.value.forEach((group) => {
  menuIterator(group)
})

const clickSignOut = () => {
  signOut({ redirectTo: localePath('/signin') })
}

const { start } = useLoadingIndicator({
  duration: 2000,
  throttle: 200,
  estimatedProgress: (duration, elapsed) => (2 / Math.PI * 100) * Math.atan(elapsed / duration * 100 / 50)

})

start({ force: true })
</script>

<template>
  <div>
    <aside
      class="fixed top-0 ltr:left-0 rtl:right-0 transition-all duration-300 hidden sm:block"
      :class="[isCollapsed ? 'w-15' : 'w-64']"
    >
      <div class="h-screen flex flex-col px-3 py-4 bg-gray-100 dark:bg-gray-800">
        <a
          v-if="!isCollapsed"
          class="ps-2.5"
        >
          <!-- <Logo /> -->
          <span
            class="ml-2 text-xl font-semibold whitespace-nowrap dark:text-white overflow-x-hidden overflow-ellipsis"
          >
            {{ t('global.appName') }}
          </span>
        </a>
        <span
          v-if="!isCollapsed"
          class="ps-2.5 ml-2 text-md font-light whitespace-nowrap dark:text-white overflow-x-hidden overflow-ellipsis"
        >
          {{ orgStore.myOrganization?.name }}
        </span>
        <Logo
          v-if="isCollapsed"
          class="h-6 w-6 ml-1"
        />
        <div
          class="flex mb-2 mt-3"
          :class="{ 'pl-2 pr-2': !isCollapsed }"
        >
          <SearchPalette
            :collapsed="isCollapsed"
            :t="t"
          />
        </div>
        <UNavigationMenu
          :items="menus"
          :collapsed="isCollapsed"
          orientation="vertical"
          class="data-[orientation=vertical]:w-full flex-1 overflow-y-auto"
        >
          <template #add>
            <CreateProgramModal />
          </template>
        </UNavigationMenu>
        <div class="flex flex-col pl-1 pr-2">
          <USeparator />
          <UTooltip
            :ui="{ content: 'w-54 flex flex-col h-auto p-0 gap-0' }"
            :delay-duration="100"
            :disable-closing-trigger="true"
          >
            <template #content>
              <UButton
                icon="i-lucide-log-out"
                size="sm"
                color="neutral"
                variant="link"
                class="w-full p-[10px]"
                @click="clickSignOut"
              >
                {{ t('global.auth.signOut') }}
              </UButton>
            </template>
            <div
              class="w-full flex items-center justify-between mt-2 pt-2 pb-2"
              :class="{ 'pl-2 pr-2': !isCollapsed }"
            >
              <div class="flex items-center">
                <UAvatar
                  :src="user?.image || undefined"
                  size="xs"
                  class="border border-gray-300 dark:border-gray-700"
                />
                <span
                  v-if="!isCollapsed"
                  class="text-xs ml-2"
                >
                  {{ user?.name }}
                </span>
              </div>
              <UIcon
                v-if="!isCollapsed"
                name="i-lucide-ellipsis-vertical"
              />
            </div>
          </UTooltip>
        </div>
      </div>
    </aside>
    <div
      class="p-2 h-screen bg-white dark:bg-gray-900 transition-all duration-300 overflow-hidden flex flex-col"
      :class="[isCollapsed ? 'ltr:sm:ml-15 rtl:sm:mr-15' : 'ltr:sm:ml-64 rtl:sm:mr-64']"
    >
      <FlexThreeColumn class="mb-2 flex-none">
        <template #left>
          <UDrawer
            class="sm:hidden"
            direction="left"
            as="aside"
            :handle="false"
          >
            <UButton
              icon="i-lucide-menu"
              class="w-8 h-8"
              color="neutral"
              variant="ghost"
            />
            <template #content>
              <div class="w-[60vw] p-4">
                <UNavigationMenu
                  orientation="vertical"
                  :items="menus"
                  class="data-[orientation=vertical]:w-full"
                >
                  <template #add>
                    <CreateProgramModal />
                  </template>
                </UNavigationMenu>
              </div>
            </template>
          </UDrawer>
          <UButton
            :icon="isCollapsed ? 'i-lucide-panel-left-open' : 'i-lucide-panel-left-close'"
            class="w-8 h-8 hidden sm:block"
            color="neutral"
            variant="ghost"
            @click="isCollapsed = !isCollapsed"
          />
          <title>{{ pathNameItemMap[route.path]?.label }}</title>
          <h1>{{ pathNameItemMap[route.path]?.label }} </h1>
          <slot name="navLeft" />
        </template>
        <template #middle>
          <slot name="navMiddle" />
        </template>
        <template #right>
          <slot name="navRight" />
          <LocaleToggler />
          <ClientOnly>
            <ColorModeToggler />
          </ClientOnly>
        </template>
      </FlexThreeColumn>
      <div class="p-2 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700 flex-1 overflow-auto">
        <slot />
      </div>
    </div>
  </div>
</template>
