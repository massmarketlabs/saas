import type { LocalePathFunction } from '#i18n'
import type { programs } from '~~/server/internal/schemas'

type Program = typeof programs.$inferSelect

function programListToMenu(
  localePath: LocalePathFunction,
  programsList: Program[] | undefined
): NavigationMenuItem[] {
  if (!programsList)
    return []

  const menu = programsList.map((x) => {
    const navigationItem: NavigationMenuItem = { label: x.name, to: localePath(`/admin/programs/${x.id}`) }
    return navigationItem
  })

  return menu
}

export const getMenus = (
  t: TranFunction,
  localePath: LocalePathFunction,
  programsList: Program[] | undefined
): NavigationMenuItem[][] => {
  const programsMenuOpts = programListToMenu(localePath, programsList)

  return [
    [
      {
        label: t('menu.dashboard'),
        icon: 'i-lucide-layout-dashboard',
        to: localePath(`/admin/dashboard`)
      },
      {
        label: t('menu.programs'),
        icon: 'material-symbols:deployed-code-outline-sharp',
        to: programsMenuOpts[0]?.to,
        children: [
          ...programsMenuOpts
        ]
      },
      {
        label: t('menu.organization'),
        icon: 'i-lucide-building',
        to: localePath(`/admin/organization/user`),
        children: [
          {
            label: t('menu.users'),
            icon: 'i-lucide-users',
            to: localePath(`/admin/organization/user`)
          },
          {
            label: t('menu.terms'),
            icon: 'i-lucide-leaf',
            to: localePath(`/admin/organization/terms`)
          },
          {
            label: t('menu.settings'),
            icon: 'i-lucide-cog',
            to: localePath(`/admin/organization/settings`)
          }
        ]
      },
      {
        label: t('menu.maintenance'),
        to: localePath(`/admin/maintenance/audit-log`),
        icon: 'i-lucide-wrench',
        children: [
          {
            label: t('menu.auditLog'),
            icon: 'i-lucide-history',
            to: localePath(`/admin/maintenance/audit-log`)
          },
          {
            label: t('menu.dbStats'),
            icon: 'i-lucide-database',
            to: localePath(`/admin/maintenance/db-stats`)
          }
        ]
      }
    ],
    [
      {
        label: t('menu.home'),
        icon: 'i-lucide-home',
        to: localePath('/')
      }
    ]
  ]
}
