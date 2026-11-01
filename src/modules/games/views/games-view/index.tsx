import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ChevronRight, Search } from 'lucide-react'
import type { GameCategory } from '#/modules/games/types'
import { GameCard } from '#/modules/games/components/game-card'
import { GAMES, GAME_CATEGORIES } from '#/modules/games/utils/catalog'
import { PageHeader } from '#/modules/shell/components/states'
import { Button } from '#/components/button'
import { Input } from '#/components/input'

const GamesView = () => {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<GameCategory | 'all'>('all')
  const q = query.trim()
  const games = GAMES.filter(
    (g) => (category === 'all' || g.category === category) && (!q || g.title.includes(q) || g.description.includes(q)),
  )

  return (
    <>
      <PageHeader
        title="بازی‌ها"
        leading={
          <Button variant="outline" size="icon" asChild>
            <Link to="/settings" aria-label="بازگشت به تنظیمات">
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
            placeholder="جست‌وجوی بازی"
            aria-label="جست‌وجوی بازی"
            className="ps-9"
          />
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto" role="group" aria-label="دسته‌بندی">
          {GAME_CATEGORIES.map((c) => (
            <Button
              key={c.value}
              size="sm"
              variant={category === c.value ? 'default' : 'secondary'}
              aria-pressed={category === c.value}
              onClick={() => setCategory(c.value)}
            >
              {c.label}
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
        <p className="py-10 text-center text-sm text-muted-foreground">بازی‌ای پیدا نشد.</p>
      )}
    </>
  )
}

export default GamesView
