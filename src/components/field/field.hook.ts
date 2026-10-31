import type { UseFieldErrorParams } from './field.types'

const useFieldError = ({ children, errors }: UseFieldErrorParams) => {
  const uniqueErrors =
    children || !errors?.length ? [] : [...new Map(errors.map((error) => [error?.message, error])).values()]
  const singleMessage = uniqueErrors.length == 1 ? uniqueErrors[0]?.message : undefined
  const showList = uniqueErrors.length > 1
  const listItems = uniqueErrors.flatMap((error, index) =>
    error?.message ? [{ key: index, message: error.message }] : [],
  )
  return {
    customContent: children || undefined,
    singleMessage,
    showList,
    listItems,
    isHidden: !children && !singleMessage && !showList,
  }
}

export { useFieldError }
