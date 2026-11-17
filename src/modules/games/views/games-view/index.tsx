import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ChevronRight, Search } from 'lucide-react'
import type { GameCategory } from '#/modules/games/types'
import { GameCard } from '#/modules/games/components/game-card'
import { GAMES, GAME_CATEGORIES } from '#/modules/games/utils/catalog'
import { PageHeader } from '#/modules/shell/components/states'
import { Button } from '#/components/button'
import { Input } from '#/components/input'
import { t } from '#/modules/shell/utils/i18n'

const GamesView = () => {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<GameCategory | 'all'>('all')
  const q = query.trim()
  const games = GAMES.filter(
    (g) =>
      (category === 'all' || g.category === category) && (!q || t(g.title).includes(q) || t(g.description).includes(q)),
  )

  return (
    <>
      <PageHeader
        title={t('games.title')}
        leading={
          <Button variant="outline" size="icon" asChild>
            <Link to="/settings" aria-label={t('games.backToSettings')}>
              <ChevronRight />
            </Link>
          </Button>
        }
      >
        <div className="relative">
          <Search
            className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('games.search')}
            aria-label={t('games.search')}
            className="ps-9"
          />
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto" role="group" aria-label={t('games.categories')}>
          {GAME_CATEGORIES.map((c) => (
            <Button
              key={c.value}
              size="sm"
              variant={category === c.value ? 'default' : 'secondary'}
              aria-pressed={category === c.value}
              onClick={() => setCategory(c.value)}
            >
              {t(c.label)}
            </Button>
          ))}
        </div>
      </PageHeader>
      {games.length ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      ) : (
        <p className="py-10 text-center text-sm text-muted-foreground">{t('games.empty')}</p>
      )}
    </>
  )
}

export default GamesView
