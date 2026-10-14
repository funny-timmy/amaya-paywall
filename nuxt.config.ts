import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  css: ['~/assets/css/main.css'],

  // Компоненты из подпапок без префикса: components/paywall/OfferCard.vue → <OfferCard>
  components: [{ path: '~/components', pathPrefix: false }],

  app: {
    head: {
      htmlAttrs: { lang: 'ru' },
      title: 'Совушка — открой все уровни',
      meta: [
        // viewport-fit=cover — чтобы в webview получить env(safe-area-inset-*)
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'theme-color', content: '#e7f1ff' },
      ],
      link: [
        // Шрифты нужны на первом экране — начинаем качать их сразу, параллельно с CSS и JS
        ...(['latin', 'cyrillic', 'latin-ext'] as const).map((subset) => ({
          rel: 'preload' as const,
          as: 'font' as const,
          type: 'font/woff2',
          href: `/fonts/nunito-${subset}-wght-normal.woff2`,
          crossorigin: 'anonymous' as const,
        })),
        { rel: 'stylesheet' as const, href: '/fonts/nunito.css' },
      ],
    },
  },

  // Файлы шрифтов не меняются — пусть webview кеширует их надолго
  routeRules: {
    '/fonts/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
  },

  runtimeConfig: {
    // NUXT_DATABASE_URL
    databaseUrl: '',
  },

  vite: {
    plugins: [tailwindcss()],
  },

  typescript: {
    strict: true,
  },
})
