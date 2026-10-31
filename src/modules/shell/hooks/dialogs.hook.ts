const useFormDialog = ({ title, description }: { title: string; description?: string }) => {
  return {
    descriptionClassName: description ? undefined : 'sr-only',
    descriptionText: description ?? title,
  }
}

export { useFormDialog }
