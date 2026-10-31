const useProgress = (value: number | null | undefined) => {
  return { indicatorStyle: { transform: `translateX(-${100 - (value || 0)}%)` } }
}

export { useProgress }
