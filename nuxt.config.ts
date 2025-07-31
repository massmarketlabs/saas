// https://nuxt.com/docs/api/configuration/nuxt-config
import type { NuxtPage } from 'nuxt/schema'
import { adminExcludes, locales } from './app/utils/locales'
import { generateRuntimeConfig } from './server/utils/runtimeConfig'

export default defineNuxtConfig({
  compatibilityDate: '2025-04-01',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],

  modules: [
    '@nuxt/ui',
    '@nuxt/eslint',
    '@nuxtjs/i18n',
    '@nuxtjs/seo',
    'nuxt-charts',
    '@pinia/nuxt',
    'reka-ui/nuxt',
    ...(process.env.NODE_ENV === 'test' ? ['@nuxt/test-utils/module'] : [])
    // ...(process.env.NUXT_NITRO_PRESET !== 'node-server' ? ['@nuxthub/core'] : [])
  ],
  // Add Vite SSR configuration to fix the "Cannot read properties of undefined (reading 'body')" error
  vite: {
    ssr: {
      noExternal: ['nuxt-charts', '@unovis/ts'],
      external: ['to-px']
    }
  },
  // ...(process.env.NUXT_NITRO_PRESET !== 'node-server'
  //   ? {
  //       hub: {
  //         workers: true,
  //         kv: true,
  //         bindings: {
  //           hyperdrive: {
  //             HYPERDRIVE: process.env.NUXT_CF_HYPERDRIVE_ID as string
  //           }
  //         }
  //       }
  //     }
  //   : {}),
  pinia: {
    storesDirs: ['./app/stores/**']
  },
  i18n: {
    vueI18n: '~/i18n/i18n.config.ts',
    baseUrl: process.env.NUXT_APP_URL,
    locales,
    defaultLocale: 'en',
    bundle: {
      optimizeTranslationDirective: false
    }
  },
  sitemap: {
    exclude: [
      '/admin/**',
      '/403',
      '/profile',
      ...adminExcludes
    ]
  },
  seo: {
    canonicalLowercase: false
  },
  robots: {
    disallow: [
      '/admin',
      '/profile'
    ]
  },
  eslint: {
    config: {
      standalone: false
    }
  },
  fonts: {
    provider: 'local'
  },
  ogImage: {
    enabled: false
  },
  icon: {
    serverBundle: false,
    clientBundle: {
      scan: {
        globInclude: ['**\/*.{vue,jsx,tsx,md,mdc,mdx}', 'app/**/*.ts']
      }
    }
  },
  future: {
    compatibilityVersion: 4
  },
  hooks: {
    'pages:extend': function (pages) {
      const pagesToRemove: NuxtPage[] = []
      pages.forEach((page) => {
        if (page.path.includes('component') || page.path.includes('/api')) {
          pagesToRemove.push(page)
        }
      })
      pagesToRemove.forEach((page: NuxtPage) => {
        pages.splice(pages.indexOf(page), 1)
      })
      // Uncomment to show current Routes
      // console.log(`\nCurrent Routes:`)
      // console.log(pages)
      // console.log(`\n`)
    }
  },
  runtimeConfig: generateRuntimeConfig(),
  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1, maximum-scale=5.0, minimum-scale=1.0',
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicons/favicon-96x96.png', sizes: '96x96' },
        { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' },
        { rel: 'shortcut icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/favicons/apple-touch-icon.png' },
        { rel: 'manifest', href: '/favicons/site.webmanifest' }
      ],
      meta: [
        { name: 'apple-mobile-web-app-title', content: process.env.NUXT_APP_NAME }
      ]
    }
  },
  nitro: {
    preset: process.env.NUXT_NITRO_PRESET,
    rollupConfig: {
      external: process.env.NUXT_NITRO_PRESET != 'node-server' ? ['pg-native'] : undefined
    }
  },
  routeRules: {
    '/intervention-manager': {
      redirect: {
        to: '/intervention-manager/dashboard',
        statusCode: 301 // Permanent redirect
      }
    },
    '/ar/intervention-manager': {
      redirect: {
        to: '/ar/intervention-manager/dashboard',
        statusCode: 301 // Permanent redirect
      }
    }
  }
})
