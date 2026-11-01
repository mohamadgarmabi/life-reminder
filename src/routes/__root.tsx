import { createRootRoute } from '@tanstack/react-router'
import { RootDocument } from '#/modules/shell/components/root-document'
import { ListSkeleton } from '#/modules/shell/components/states'
import NotFoundView from '#/modules/shell/views/not-found-view'
import RootView from '#/modules/shell/views/root-view'
import appCss from '../styles.css?url'

const base = import.meta.env.BASE_URL

const RootRoute = () => <RootView />
const RootPending = () => <ListSkeleton />
const RootNotFound = () => <NotFoundView />

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover'},
      { title: 'یادآور زندگی' },
      { name: 'description', content: 'مدیریت اقساط، آبیاری گل‌ها و یادآورهای شخصی — آفلاین و روی دستگاه خودتان.' },
      { name: 'theme-color', media: '(prefers-color-scheme: light)', content: '#f2f2f7' },
      { name: 'theme-color', media: '(prefers-color-scheme: dark)', content: '#000000' },
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
      {name:"", content: ""}
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'manifest', href: `${base}manifest.webmanifest` },
      { rel: 'icon', href: `${base}favicon.svg`, type: 'image/svg+xml' },
      { rel: 'apple-touch-icon', href: `${base}apple-touch-icon-180x180.png` },
    ],
  }),
  shellComponent: RootDocument,
  component: RootRoute,
  pendingComponent: RootPending,
  notFoundComponent: RootNotFound,
})
