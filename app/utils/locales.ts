import type { LocaleObject } from '@nuxtjs/i18n'
import * as nuxtLocales from '@nuxt/ui/locale'

export const locales: LocaleObject[] = [
  { code: nuxtLocales.en.code as 'en', dir: nuxtLocales.en.dir, language: 'en-US', name: nuxtLocales.en.name },
  { code: nuxtLocales.ar.code as 'ar', dir: nuxtLocales.ar.dir, language: 'ar', name: nuxtLocales.ar.name }
  // { ...nuxtLocales.en, language: 'en-US' },
  // { ...nuxtLocales.ar, language: 'ar' }
]

export const adminExcludes = locales
  .filter(locale => locale.code !== 'en')
  .map(locale => `/${locale.code}/admin/**`)

export function getDirection(local: string) {
  return locales.find(x => x.code === local)?.dir || 'ltr'
}
