import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

const getRouter = () => {
  const router = createTanStackRouter({
    routeTree,
    scrollRestoration: true,
    scrollToTopSelectors: ['#app-scroll'], // pages scroll inside AppShell's container, not the window
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
  })

  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}

export { getRouter }
