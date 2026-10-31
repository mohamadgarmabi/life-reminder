import 'fake-indexeddb/auto'

// jsdom lacks ResizeObserver, which Radix primitives (Switch, Select) use for sizing.
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
}
