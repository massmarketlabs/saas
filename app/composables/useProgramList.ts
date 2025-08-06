export const useProgramList = async () => {
  const requestFetch = useRequestFetch()
  const programs = await useAsyncData(
    async () => await requestFetch('/api/admin/programs')
  )

  return programs
}
