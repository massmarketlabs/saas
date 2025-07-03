import type { Organization } from 'better-auth/plugins'

export const useOrganizationStore = defineStore('organizations', () => {
  const toast = useToast()
  const { organization } = useAuth()
  const route = useRoute()

  const organizationsList = ref<Organization[]>([])

  const myOrganization = computed(() => organizationsList.value.find(org => org.slug === route.params.orgslug))

  const fetchOrganizations = async () => {
    if (organizationsList.value.length !== 0) {
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
