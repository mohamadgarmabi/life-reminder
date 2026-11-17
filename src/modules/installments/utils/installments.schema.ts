import { z } from 'zod'
import { id, isoDate, isoDateTime, notes } from '#/modules/shell/utils/zod'
import { t } from '#/modules/shell/utils/i18n'

const installmentSchema = z
  .object({
    id,
    title: z
      .string()
      .trim()
      .min(1, { error: () => t('installments.error.titleRequired') })
      .max(100),
    amount: z.number().positive({ error: () => t('installments.error.amountRequired') }),
    currency: z.string().min(1),
    /** Day of the Jalali month; clamped to the month's last day (e.g. 31 → 30 in Mehr). */
    dueDay: z.number().int().min(1).max(31),
    startDate: isoDate,
    totalPayments: z
      .number()
      .int()
      .min(1, { error: () => t('installments.error.minPayments') })
      .max(600),
    paidPayments: z.number().int().min(0),
    reminderDaysBefore: z.array(z.number().int().min(0).max(30)),
    // default: records saved before tags existed
    tags: z.array(z.string().trim().min(1).max(30)).max(20).default([]),
    notes,
    isActive: z.boolean(),
    createdAt: isoDateTime,
    updatedAt: isoDateTime,
  })
  .refine((v) => v.paidPayments <= v.totalPayments, {
    error: () => t('installments.error.paidExceeds'),
    path: ['paidPayments'],
  })

const paymentSchema = z.object({
  id,
  installmentId: id,
  /** 0-based payment number; unique per installment so a payment can't be recorded twice. */
  index: z.number().int().min(0),
  dueDate: isoDate,
  amount: z.number().nonnegative(),
  paidAt: isoDateTime,
})

const installmentFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, { error: () => t('installments.error.titleRequired') })
      .max(100, { error: () => t('installments.error.titleTooLong') }),
    amount: z.number().positive({ error: () => t('installments.error.amountRequired') }),
    dueDay: z.number().int().min(1).max(31),
    startDate: isoDate,
    totalPayments: z
      .number()
      .int()
      .min(1, { error: () => t('installments.error.minPayments') })
      .max(600, { error: () => t('installments.error.maxPayments') }),
    paidPayments: z.number().int().min(0),
    reminderDaysBefore: z.array(z.number().int()),
    tags: z
      .array(
        z
          .string()
          .trim()
          .min(1)
          .max(30, { error: () => t('installments.error.tagTooLong') }),
      )
      .max(20, { error: () => t('installments.error.maxTags') }),
    notes: z.string().max(2000),
    isActive: z.boolean(),
  })
  .refine((v) => v.paidPayments <= v.totalPayments, {
    error: () => t('installments.error.paidExceeds'),
    path: ['paidPayments'],
  })

export { installmentSchema, paymentSchema, installmentFormSchema }
