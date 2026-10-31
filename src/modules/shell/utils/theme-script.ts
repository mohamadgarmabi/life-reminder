import { SETTINGS_KEY } from '#/modules/settings/stores/settings.store'

// Runs before first paint so a dark-theme user never sees a light flash.
const themeScript = `try{var t=(JSON.parse(localStorage.getItem('${SETTINGS_KEY}'))||{}).theme;if(t==='dark'||(t!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch(e){}`

const themeScriptHtml = { __html: themeScript }

export { themeScript, themeScriptHtml }
