import { z } from 'zod'
import { id, isoDate, isoDateTime, notes } from '#/lib/zod'

export const installmentSchema = z
  .object({
    id,
    title: z.string().trim().min(1, 'عنوان را وارد کنید').max(100),
    amount: z.number().positive('مبلغ را وارد کنید'),
    currency: z.string().min(1),
    /** Day of the Jalali month; clamped to the month's last day (e.g. 31 → 30 in Mehr). */
    dueDay: z.number().int().min(1).max(31),
    startDate: isoDate,
    totalPayments: z.number().int().min(1, 'حداقل یک قسط').max(600),
    paidPayments: z.number().int().min(0),
    reminderDaysBefore: z.array(z.number().int().min(0).max(30)),
    notes,
    isActive: z.boolean(),
    createdAt: isoDateTime,
    updatedAt: isoDateTime,
  })
  .refine((v) => v.paidPayments <= v.totalPayments, {
    message: 'تعداد پرداخت‌شده بیشتر از کل اقساط است',
    path: ['paidPayments'],
  })
export type Installment = z.infer<typeof installmentSchema>

export const paymentSchema = z.object({
  id,
  installmentId: id,
  /** 0-based payment number; unique per installment so a payment can't be recorded twice. */
  index: z.number().int().min(0),
  dueDate: isoDate,
  amount: z.number().nonnegative(),
  paidAt: isoDateTime,
})
export type Payment = z.infer<typeof paymentSchema>

export const installmentFormSchema = z
  .object({
    title: z.string().trim().min(1, 'عنوان را وارد کنید').max(100, 'عنوان طولانی است'),
    amount: z.number().positive('مبلغ را وارد کنید'),
    dueDay: z.number().int().min(1).max(31),
    startDate: isoDate,
    totalPayments: z.number().int().min(1, 'حداقل یک قسط').max(600, 'حداکثر ۶۰۰ قسط'),
    paidPayments: z.number().int().min(0),
    reminderDaysBefore: z.array(z.number().int()),
    notes: z.string().max(2000),
    isActive: z.boolean(),
  })
  .refine((v) => v.paidPayments <= v.totalPayments, {
    message: 'تعداد پرداخت‌شده بیشتر از کل اقساط است',
    path: ['paidPayments'],
  })
export type InstallmentFormValues = z.infer<typeof installmentFormSchema>
