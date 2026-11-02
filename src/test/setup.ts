import 'fake-indexeddb/auto'
import { vi } from 'vitest'

// jsdom lacks ResizeObserver, which Radix primitives (Switch, Select) use for sizing.
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// jsdom lacks matchMedia, which the glass layer reads (theme / reduced transparency).
globalThis.matchMedia ??= (query: string) =>
  ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }) as MediaQueryList

// jsdom has no canvas, which the glass renderer needs to draw its refraction maps; tests skip the glass.
vi.mock('simple-liquid-glass', async (importOriginal) => ({
  ...(await importOriginal<typeof import('simple-liquid-glass')>()),
  LiquidGlass: () => null,
}))
