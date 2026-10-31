import { readFileSync, writeFileSync } from 'node:fs'
import { defineConfig, type Plugin } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA, type VitePluginPWAAPI } from 'vite-plugin-pwa'
import { viteSplashScreen } from 'vite-plugin-react-splash'
import { redact } from '@tanstack/redact/vite'

// GitHub Pages project sites live under /<repo>/; CI sets BASE_PATH, local dev uses "/".
const base = process.env.BASE_PATH ?? '/'
const { version } = JSON.parse(readFileSync('package.json', 'utf8')) as {
  version: string
}
const outDir = 'dist/client'

const pwa = VitePWA({
  outDir,
  registerType: 'prompt',
  injectRegister: false, // registered by <UpdatePrompt /> via virtual:pwa-register/react
  includeAssets: ['favicon.svg', 'favicon.ico', 'apple-touch-icon-180x180.png'],
  manifest: {
    name: 'یادآور زندگی',
    short_name: 'یادآور',
    description: 'مدیریت اقساط، آبیاری گل‌ها و یادآورهای شخصی',
    lang: 'fa',
    dir: 'rtl',
    start_url: base,
    scope: base,
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#f2f2f7',
    theme_color: '#f2f2f7',
    icons: [
      { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
      { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
      {
        src: 'maskable-icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2,webmanifest}'],
    globIgnores: ['404.html', '_shell.html'],
    navigateFallback: `${base}index.html`,
    importScripts: ['sw-notifications.js'],
    cleanupOutdatedCaches: true,
  },
})

const logo = readFileSync('public/favicon.svg', 'utf8')
const splash = viteSplashScreen({
  // Dark splash shows the inverted icon (white tile, black bell) so it stands out on black.
  logo: {
    light: logo,
    dark: logo.replace('fill="#000"', 'fill="#fff"').replace('stroke="#fff"', 'stroke="#000"'),
  },
  mode: 'auto',
  text: 'یادآور زندگی',
  textStyle: {
    fontFamily: "'Vazirmatn Variable', -apple-system, system-ui, sans-serif",
    fontWeight: 600,
    fontSize: '1.0625rem',
  },
  animation: 'fade',
  theme: {
    light: { background: '#f2f2f7', color: '#000000' },
    dark: { background: '#000000', color: '#ffffff' },
  },
  waitUntilReady: true, // hidden by the root route once the database is open
  minDuration: 700,
  respectReducedMotion: true,
})
// The plugin hooks transformIndexHtml, which TanStack Start never runs (no index.html), so its
// transform is applied to the prerendered shell below.
const injectSplash = (html: string) => {
  const hook = splash.transformIndexHtml
  const fn = typeof hook === 'function' ? hook : hook && 'handler' in hook ? hook.handler : undefined
  if (!fn) throw new Error('vite-plugin-react-splash: transformIndexHtml not found')
  return fn.call(undefined as never, html, undefined as never) as string
}

/**
 * TanStack Start writes the SPA shell (_shell.html) only after all environment builds, so the
 * PWA plugin's own hook runs too early. After prerendering: inject the splash screen, expose the shell as index.html
 * (site root) and 404.html (GitHub Pages fallback for deep links/refreshes), then generate the
 * service worker so its precache includes the final HTML.
 */
const staticSpaOutput: Plugin = {
  name: 'static-spa-output',
  enforce: 'post', // after tanstack-start-core:post-build (also enforce/order post, earlier in the list)
  apply: 'build',
  buildApp: {
    order: 'post',
    handler: async () => {
      const html = injectSplash(readFileSync(`${outDir}/_shell.html`, 'utf8'))
      writeFileSync(`${outDir}/index.html`, html)
      writeFileSync(`${outDir}/404.html`, html)
      const api = pwa.find((p) => p.name === 'vite-plugin-pwa')?.api as VitePluginPWAAPI | undefined
      if (!api) throw new Error('vite-plugin-pwa API not found')
      await api.generateSW()
    },
  },
}

const config = defineConfig({
  base,
  define: { __APP_VERSION__: JSON.stringify(version) },
  resolve: { tsconfigPaths: true },
  ssr: { noExternal: true },
  plugins: [
    tailwindcss(),
    tanstackStart({ spa: { enabled: true } }),
    viteReact(),
    babel({ presets: [reactCompilerPreset()] }), // React Compiler: no manual useMemo/useCallback
    redact(),
    pwa,
    staticSpaOutput,
  ],
})

export default config
