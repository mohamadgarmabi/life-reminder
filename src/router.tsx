import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { settingsStore } from '#/modules/settings/stores/settings.store'
import { routeTree } from './routeTree.gen'

const getRouter = () => {
  const router = createTanStackRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
    // View Transitions (styles.css): deeper path = iOS push, shallower = pop, between tabs = crossfade.
    // Search-only changes (e.g. ?new=1 opening a sheet) don't animate the page.
    defaultViewTransition: {
      types: ({ fromLocation, toLocation, pathChanged }) => {
        if (!settingsStore.state.pageTransitions || !pathChanged || !fromLocation) return false
        const from = fromLocation.pathname.replace(/\/$/, '')
        const to = toLocation.pathname.replace(/\/$/, '')
        if (to.startsWith(`${from}/`)) return ['push']
        if (from.startsWith(`${to}/`)) return ['pop']
        return ['tab']
      },
    },
  })

  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}

export { getRouter }
