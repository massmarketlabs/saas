import type { LocalePathFunction } from '#i18n'

export const getMenuInterventionManager = (
  t: TranFunction,
  localePath: LocalePathFunction
): NavigationMenuItem[][] => {
  const menuItems = [[{
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
  }]] satisfies NavigationMenuItem[][]

  return menuItems
}
