import type { LocalePathFunction } from '#i18n'
import type { programs } from '~~/server/database/schema'

type Program = typeof programs.$inferSelect

function programListToMenu(
  localePath: LocalePathFunction,
  programsList: Program[] | undefined,
  organizationSlug: string
): NavigationMenuItem[] {
  if (!programsList) {
    return []
  }

  const menu = programsList.map((x) => {
    const navigationItem: NavigationMenuItem = { label: x.name, to: localePath(`/${organizationSlug}/admin/programs/${x.id}`) }
    return navigationItem
  })
  const addSlot: NavigationMenuItem = { slot: 'add' as const }
  menu.push(addSlot)

  return menu
}

export const getMenus = (
  t: TranFunction,
  localePath: LocalePathFunction,
  programsList: Program[] | undefined,
  organizationSlug?: string
): NavigationMenuItem[][] => {
  if (!organizationSlug)
    return []

  const programsMenuOpts = programListToMenu(localePath, programsList, organizationSlug)

  return [
    [
      {
        label: t('menu.dashboard'),
        icon: 'i-lucide-layout-dashboard',
        to: localePath(`/${organizationSlug}/admin/dashboard`)
      },
      {
        label: t('menu.finance'),
        icon: 'i-lucide-chart-candlestick',
        to: localePath(`/${organizationSlug}/admin/donors`),
        children: [{
          label: t('menu.donors'),
          icon: 'hugeicons:money-receive-circle',
          to: localePath(`/${organizationSlug}/admin/donors`)
        }]
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
        label: t('menu.beneficiary'),
        icon: 'hugeicons:student',
        to: localePath(`/${organizationSlug}/admin/beneficiary`)
      },
      {
        label: t('menu.organization'),
        icon: 'i-lucide-building',
        to: localePath(`/${organizationSlug}/admin/organization/user`),
        children: [
          {
            label: t('menu.users'),
            icon: 'i-lucide-users',
            to: localePath(`/${organizationSlug}/admin/organization/user`)
          },
          {
            label: t('menu.settings'),
            icon: 'i-lucide-cog',
            to: localePath(`/${organizationSlug}/admin/organization/settings`)
          }
        ]
      },
      {
        label: t('menu.maintenance'),
        to: localePath(`/${organizationSlug}/admin/maintenance/audit-log`),
        icon: 'i-lucide-wrench',
        children: [
          {
            label: t('menu.auditLog'),
            icon: 'i-lucide-history',
            to: localePath(`/${organizationSlug}/admin/maintenance/audit-log`)
          },
          {
            label: t('menu.dbStats'),
            icon: 'i-lucide-database',
            to: localePath(`/${organizationSlug}/admin/maintenance/db-stats`)
          }
        ]
      }
    ],
    [
      {
        label: t('menu.home'),
        icon: 'i-lucide-home',
        to: localePath('/')
      },
      {
        label: t('menu.interventionManager'),
        icon: 'mdi:google-classroom',
        to: localePath(`/${organizationSlug}/intervention-manager/dashboard`)
      }
    ]
  ]
}
