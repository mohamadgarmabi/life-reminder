import { cva } from 'class-variance-authority'

const fieldVariants = cva('group/field flex w-full gap-3 data-[invalid=true]:text-destructive', {
  variants: {
    orientation: {
      vertical: ['flex-col [&>*]:w-full [&>.sr-only]:w-auto'],
      horizontal: [
        'flex-row items-center',
        '[&>[data-slot=field-label]]:flex-auto',
        'has-[>[data-slot=field-content]]:items-start has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px',
      ],
      responsive: [
        [
          'flex-col',
          '@md/field-group:flex-row @md/field-group:items-center @md/field-group:[&>*]:w-auto',
          '[&>*]:w-full',
          '[&>.sr-only]:w-auto',
        ],
        '@md/field-group:[&>[data-slot=field-label]]:flex-auto',
        '@md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px',
      ],
    },
  },
  defaultVariants: {
    orientation: 'vertical',
  },
})

const fieldSetVariants = cva([
  'flex flex-col gap-6',
  'has-[>[data-slot=checkbox-group]]:gap-3',
  'has-[>[data-slot=radio-group]]:gap-3',
])

const fieldLegendVariants = cva('mb-3 font-medium data-[variant=legend]:text-base data-[variant=label]:text-sm')

const fieldGroupVariants = cva([
  'group/field-group @container/field-group flex w-full flex-col gap-7',
  'data-[slot=checkbox-group]:gap-3',
  '[&>[data-slot=field-group]]:gap-4',
])

const fieldContentVariants = cva('group/field-content flex flex-1 flex-col gap-1.5 leading-snug')

const fieldLabelVariants = cva([
  'group/field-label peer/field-label flex w-fit gap-2 leading-snug',
  'group-data-[disabled=true]/field:opacity-50',
  'has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col has-[>[data-slot=field]]:rounded-md has-[>[data-slot=field]]:border',
  '[&>*]:data-[slot=field]:p-4',
  'has-data-[state=checked]:border-primary has-data-[state=checked]:bg-primary/5',
  'dark:has-data-[state=checked]:bg-primary/10',
])

const fieldTitleVariants = cva([
  'flex w-fit items-center gap-2 text-sm leading-snug font-medium',
  'group-data-[disabled=true]/field:opacity-50',
])

const fieldDescriptionVariants = cva([
  'text-sm leading-normal font-normal text-muted-foreground',
  'group-has-[[data-orientation=horizontal]]/field:text-balance',
  'last:mt-0',
  'nth-last-2:-mt-1',
  '[[data-variant=legend]+&]:-mt-1.5',
  '[&>a]:underline [&>a]:underline-offset-4',
  '[&>a:hover]:text-primary',
])

const fieldSeparatorVariants = cva('relative -my-2 h-5 text-sm group-data-[variant=outline]/field-group:-mb-2')

const fieldSeparatorLineVariants = cva('absolute inset-0 top-1/2')

const fieldSeparatorContentVariants = cva('relative mx-auto block w-fit bg-background px-2 text-muted-foreground')

const fieldErrorVariants = cva('text-sm font-normal text-destructive')

const fieldErrorListVariants = cva('ms-4 flex list-disc flex-col gap-1')

export {
  fieldVariants,
  fieldSetVariants,
  fieldLegendVariants,
  fieldGroupVariants,
  fieldContentVariants,
  fieldLabelVariants,
  fieldTitleVariants,
  fieldDescriptionVariants,
  fieldSeparatorVariants,
  fieldSeparatorLineVariants,
  fieldSeparatorContentVariants,
  fieldErrorVariants,
  fieldErrorListVariants,
}
