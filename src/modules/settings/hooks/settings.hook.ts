import { toFaDigits } from '#/modules/shell/utils/format'

const useSettings = () => ({ versionLabel: toFaDigits(__APP_VERSION__) })

export { useSettings }
