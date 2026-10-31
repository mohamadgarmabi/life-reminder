import { HeadContent, Scripts } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { DirectionProvider } from '#/modules/shell/components/ui/direction'
import { themeScriptHtml } from '#/modules/shell/utils/theme-script'

const RootDocument = ({ children }: { children: ReactNode }) => {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={themeScriptHtml} />
        <HeadContent />
      </head>
      <body>
        <DirectionProvider dir="rtl">{children}</DirectionProvider>
        <Scripts />
      </body>
    </html>
  )
}

export { RootDocument }
