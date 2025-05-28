import * as nuxtLocales from '@nuxt/ui/locale'

export const locales = [
  nuxtLocales.en,
  nuxtLocales.ar
]

export const adminExcludes = locales
  .filter(locale => locale.code !== 'en')
  .map(locale => `/${locale.code}/admin/**`)

export function getDirection(local: string) {
  return locales.find(x => x.code === local)?.dir || 'ltr'
}
