import type { LocalePathFunction } from '#i18n'

export const getMenus = (t: TranFunction, localePath: LocalePathFunction): NavigationMenuItem[][] => {
  return [
    [
      {
        label: t('menu.dashboard'),
        icon: 'i-lucide-layout-dashboard',
        to: localePath('/admin/dashboard')
      },
      {
        label: t('menu.users'),
        icon: 'i-lucide-users',
        to: localePath('/admin/user')
      },
      // {
      //   label: t('menu.subscriptions'),
      //   icon: 'i-lucide-credit-card',
      //   to: localePath('/admin/subscription')
      // },
      {
        label: t('menu.donors'),
        icon: 'hugeicons:money-receive-circle',
        to: localePath('/admin/donors')
      },
      {
        label: t('menu.programs'),
        icon: 'material-symbols:deployed-code-outline-sharp',
        to: localePath('/admin/programs')
      },
      {
        label: t('menu.beneficiary'),
        icon: 'hugeicons:student',
        to: localePath('/admin/beneficiary')
      },
      {
        label: t('menu.interventions'),
        icon: 'mdi:google-classroom',
        to: localePath('/admin/interventions')
      },
      {
        label: t('menu.maintenance'),
        icon: 'i-lucide-wrench',
        children: [
          {
            label: t('menu.auditLog'),
            icon: 'i-lucide-history',
            to: localePath('/admin/maintenance/audit-log')
          },
          {
            label: t('menu.dbStats'),
            icon: 'i-lucide-database',
            to: localePath('/admin/maintenance/db-stats')
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
      // {
      //   label: 'GitHub',
      //   icon: 'i-lucide-github',
      //   to: appRepo,
      //   target: '_blank'
      // }
    ]
  ]
}
