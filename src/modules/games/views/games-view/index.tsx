import { Gem, Grid3x3 } from 'lucide-react'
import { BackButton } from '#/modules/games/components/back-button'
import { GameCard } from '#/modules/games/components/game-card'
import { PageHeader } from '#/modules/shell/components/states'

const GamesView = () => {
  return (
    <>
      <PageHeader title="بازی‌ها" action={<BackButton to="/settings" label="تنظیمات" />} />
      <div className="space-y-3">
        <GameCard to="/games/sudoku" icon={Grid3x3} title="سودوکو" description="سه سطح دشواری، هر کدام هزار مرحله" />
        <GameCard
          to="/games/match3"
          icon={Gem}
          title="سه‌تایی"
          description="نگین‌های هم‌شکل را جفت‌وجور کن؛ صد مرحله"
        />
      </div>
    </>
  )
}

export default GamesView
