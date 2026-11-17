import { toLocalDigits } from '#/modules/shell/utils/format'

const useSettings = () => ({ versionLabel: toLocalDigits(__APP_VERSION__) })

export { useSettings }
