import { SETTINGS_KEY } from '#/modules/settings/stores/settings.store'

// Runs before first paint so a dark-theme user never sees a light flash, and an English user never sees RTL.
const themeScript = `try{var s=JSON.parse(localStorage.getItem('${SETTINGS_KEY}'))||{},d=document.documentElement,t=s.theme;if(t==='dark'||(t!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches))d.classList.add('dark');if(s.language==='en'){d.lang='en';d.dir='ltr'}}catch(e){}`

const themeScriptHtml = { __html: themeScript }

export { themeScript, themeScriptHtml }
