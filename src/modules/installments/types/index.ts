import type { z } from 'zod'
import type { IsoDate } from '#/modules/shell/types'
import type {
  installmentFormSchema,
  installmentSchema,
  paymentSchema,
} from '#/modules/installments/utils/installments.schema'

type Installment = z.infer<typeof installmentSchema>

type Payment = z.infer<typeof paymentSchema>

type InstallmentFormValues = z.infer<typeof installmentFormSchema>

type InstallmentStatus = 'done' | 'paused' | 'overdue' | 'today' | 'soon' | 'upcoming'

type InstallmentCardProps = {
  inst: Installment
  today: IsoDate
  onEdit: () => void
  onHistory: () => void
  onDelete: () => void
}

type InstallmentFormProps = {
  initial?: Installment
  onSubmit: (values: InstallmentFormValues) => Promise<void>
}

type PaymentHistoryProps = { inst: Installment }

export type {
  Installment,
  Payment,
  InstallmentFormValues,
  InstallmentStatus,
  InstallmentCardProps,
  InstallmentFormProps,
  PaymentHistoryProps,
}
