import type { Organization } from 'better-auth/plugins'

export const useOrganizationStore = defineStore('organizations', () => {
  const toast = useToast()
  const { organization, user } = useAuth()

  const organizationsList = ref<Organization[]>([])
  // It is assumed that all users currently are assigned to one organization.
  const myOrganization = computed(() => organizationsList.value[0])

  const fetchOrganizations = async () => {
    if (organizationsList.value.length !== 0 || !user.value) {
      return
    }
    const orgs = await organization.list()
    if (orgs.error) {
      toast.add({
        color: 'error',
        title: 'Unable to fetch organization. Please try again later.',
        description: 'If this issue persists, contact an admin.'
      })
      return
    }

    organizationsList.value = orgs.data
  }
  return { organizationsList, myOrganization, fetchOrganizations }
})
