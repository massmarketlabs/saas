import type { InternalApi } from 'nitropack'

export function generateContentMenu(intervention: Ref<InternalApi['/api/lms/intervention/:id']['post'] | undefined>): NavigationMenuItem[][] {
  if (!intervention.value || !intervention.value.id)
    return [] as NavigationMenuItem[][]

  const base = [
    { label: 'Syllabus', icon: 'material-symbols:document-scanner-outline', to: `/intervention/${intervention.value.id}/content` as const },
    { label: 'Bookmarks', icon: 'material-symbols:bookmarks-outline', to: `/intervention/${intervention.value.id}/content/bookmarks` as const },
    { label: 'Intervention Schedule', icon: 'i-lucide-calendar', to: `/intervention/${intervention.value.id}/content/calendar` as const }
  ]

  return [
    base,
    [
      {
        open: true,
        label: 'Table of Contents',
        badge: '12',
        children: intervention.value?.subjects.map(subject => ({ label: subject.title, to: `/intervention/${intervention.value.id}/content/${subject.id}` }))

      }
    ]
  ]
}
