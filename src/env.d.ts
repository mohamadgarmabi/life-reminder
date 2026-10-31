/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/react" />

declare const __APP_VERSION__: string

interface ImportMetaEnv {
  /** Push relay URL (push-worker/); without it notifications only fire while the app is open. */
  readonly VITE_PUSH_URL?: string
  readonly VITE_VAPID_PUBLIC_KEY?: string
}
