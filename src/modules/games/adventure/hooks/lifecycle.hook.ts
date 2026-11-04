import { useEffect } from 'react'
import type { Engine } from '#/modules/games/adventure/stores/session.store'
import { pause, saveNow } from '#/modules/games/adventure/stores/engine.actions'
import { loadSave, loadSettings } from '#/modules/games/adventure/utils/save'
import { patchGame } from '#/modules/games/adventure/stores/session.store'
import { setVolumes, unloadAll } from '#/modules/games/adventure/utils/audio'

const AUTOSAVE_MS = 30_000

/** Loads save + settings, pauses on interruptions, autosaves, and frees audio on leave. */
const useAdventureLifecycle = (engine: Engine, markReady: (step: 'data') => void) => {
  useEffect(() => {
    const { store, world } = engine
    let alive = true
    void Promise.all([loadSave(world), loadSettings()]).then(([save, settings]) => {
      if (!alive) return
      setVolumes({ music: settings.musicVolume, sfx: settings.sfxVolume })
      patchGame(store, { saveStatus: save.status, settings, loadedSave: save.status === 'ok' ? save.save : null })
      markReady('data')
    })

    // iOS fires these for calls, app switching and locking; never auto-resume.
    const onHide = () => {
      if (document.visibilityState === 'hidden') pause(engine)
    }
    const onPageHide = () => {
      pause(engine)
      void saveNow(engine)
    }
    document.addEventListener('visibilitychange', onHide)
    window.addEventListener('pagehide', onPageHide)

    // Event saves: item, puzzle, secret or checkpoint changes.
    let prev = store.state.session
    const sub = store.subscribe((g) => {
      const s = g.session
      if (g.phase !== 'loading' && g.phase !== 'menu' && s !== prev) {
        const changed =
          s.inventory !== prev.inventory ||
          s.puzzles !== prev.puzzles ||
          s.secrets !== prev.secrets ||
          s.checkpointId !== prev.checkpointId ||
          s.completed !== prev.completed
        prev = s
        if (changed) void saveNow(engine)
      }
    })

    const timer = window.setInterval(() => {
      if (store.state.phase === 'playing') void saveNow(engine)
    }, AUTOSAVE_MS)

    return () => {
      alive = false
      document.removeEventListener('visibilitychange', onHide)
      window.removeEventListener('pagehide', onPageHide)
      sub.unsubscribe()
      window.clearInterval(timer)
      if (store.state.phase !== 'loading' && store.state.phase !== 'menu') void saveNow(engine)
      unloadAll()
    }
  }, [engine, markReady])
}

export { useAdventureLifecycle }
