const useListSkeleton = (rows: number) => {
  return { rowKeys: Array.from({ length: rows }, (_, i) => i) }
}

export { useListSkeleton }
