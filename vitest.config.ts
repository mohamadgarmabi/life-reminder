import { defineConfig } from 'vitest/config'
import viteReact from '@vitejs/plugin-react'

// Separate from vite.config.ts so tests don't run the TanStack Start/PWA build plugins.
export default defineConfig({
  plugins: [viteReact()],
  resolve: { tsconfigPaths: true },
  test: {
    setupFiles: ['./src/test/setup.ts'],
    // Pin the zone so date assertions are deterministic on any machine/CI.
    env: { TZ: 'Asia/Tehran' },
  },
})
