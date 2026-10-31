import { defineConfig } from 'vitest/config'
import viteReact from '@vitejs/plugin-react'

// Separate from vite.config.ts so tests don't run the TanStack Start/PWA build plugins.
const config = defineConfig({
  plugins: [viteReact()],
  define: { __APP_VERSION__: '"test"', __APP_COMMIT__: '""' },
  resolve: { tsconfigPaths: true },
  test: {
    setupFiles: ['./src/test/setup.ts'],
    // Pin the zone so date assertions are deterministic on any machine/CI.
    env: { TZ: 'Asia/Tehran' },
  },
})

export default config
