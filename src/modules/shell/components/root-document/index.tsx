import { HeadContent, Scripts } from '@tanstack/react-router'
import { Fragment, type ReactNode } from 'react'
import { DirectionProvider } from '#/components/direction'
import { useI18n } from '#/modules/shell/hooks/i18n.hook'
import { themeScriptHtml } from '#/modules/shell/utils/theme-script'

const RootDocument = ({ children }: { children: ReactNode }) => {
  const { lang, dir } = useI18n()

  return (
    <html lang={lang} dir={dir} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={themeScriptHtml} />
        <HeadContent />
      </head>
      <body>
        <DirectionProvider dir={dir}>
          {/* Remount on a language change so every plain t() / formatter call re-runs. */}
          <Fragment key={lang}>{children}</Fragment>
        </DirectionProvider>
        <Scripts />
      </body>
    </html>
  )
}

export { RootDocument }
