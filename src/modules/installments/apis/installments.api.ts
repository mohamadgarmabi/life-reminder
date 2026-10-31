import { abortTx, getDb, newId, validRecords } from '#/modules/database/apis/database.api'
import { notifyDbChange } from '#/modules/database/utils/live'
import { nowIso } from '#/modules/shell/utils/dates'
import { installmentSchema, paymentSchema } from '#/modules/installments/utils/installments.schema'
import { type Installment, type InstallmentFormValues, type Payment } from '#/modules/installments/types'
import { paymentDueDate } from '#/modules/installments/utils/schedule'

class PaymentConflictError extends Error {}

const installmentRepo = {
  list: async (): Promise<Installment[]> => {
    const db = await getDb()
    return validRecords(installmentSchema, await db.getAll('installments'), 'installments')
  },

  create: async (values: InstallmentFormValues): Promise<Installment> => {
    const now = nowIso()
    const record = installmentSchema.parse({
      ...values,
      id: newId(),
      currency: 'IRT',
      notes: values.notes.trim() || null,
      createdAt: now,
      updatedAt: now,
    })
    await (await getDb()).add('installments', record)
    notifyDbChange()
    return record
  },

  update: async (id: string, values: Omit<InstallmentFormValues, 'paidPayments'>): Promise<Installment> => {
    const db = await getDb()
    const tx = db.transaction('installments', 'readwrite')
    const current = installmentSchema.parse(await tx.store.get(id))
    const record = installmentSchema.parse({
      ...current,
      ...values,
      paidPayments: current.paidPayments,
      notes: values.notes.trim() || null,
      updatedAt: nowIso(),
    })
    await tx.store.put(record)
    await tx.done
    notifyDbChange()
    return record
  },

  remove: async (id: string) => {
    const db = await getDb()
    const tx = db.transaction(['installments', 'payments'], 'readwrite')
    const payments = tx.objectStore('payments')
    for (const key of await payments.index('byInstallment').getAllKeys(id)) await payments.delete(key)
    await tx.objectStore('installments').delete(id)
    await tx.done
    notifyDbChange()
  },

  payments: async (installmentId: string): Promise<Payment[]> => {
    const db = await getDb()
    const rows = await db.getAllFromIndex('payments', 'byInstallment', installmentId)
    return validRecords(paymentSchema, rows, 'payments').sort((a, b) => b.index - a.index)
  },

  markPaid: async (id: string, index: number): Promise<Payment> => {
    const db = await getDb()
    const tx = db.transaction(['installments', 'payments'], 'readwrite')
    const inst = installmentSchema.parse(await tx.objectStore('installments').get(id))
    if (inst.paidPayments !== index || index >= inst.totalPayments) {
      abortTx(tx)
      throw new PaymentConflictError('این قسط قبلاً ثبت شده است.')
    }
    const payment: Payment = {
      id: newId(),
      installmentId: id,
      index,
      dueDate: paymentDueDate(inst, index),
      amount: inst.amount,
      paidAt: nowIso(),
    }
    // Unique [installmentId, index] index is the last line of defence against duplicates.
    await tx.objectStore('payments').add(payment)
    await tx.objectStore('installments').put({ ...inst, paidPayments: index + 1, updatedAt: nowIso() })
    await tx.done
    notifyDbChange()
    return payment
  },

  undoPayment: async (paymentId: string) => {
    const db = await getDb()
    const tx = db.transaction(['installments', 'payments'], 'readwrite')
    const payment = paymentSchema.parse(await tx.objectStore('payments').get(paymentId))
    const inst = installmentSchema.parse(await tx.objectStore('installments').get(payment.installmentId))
    if (inst.paidPayments !== payment.index + 1) {
      abortTx(tx)
      throw new PaymentConflictError('فقط آخرین پرداخت قابل لغو است.')
    }
    await tx.objectStore('payments').delete(paymentId)
    await tx.objectStore('installments').put({ ...inst, paidPayments: payment.index, updatedAt: nowIso() })
    await tx.done
    notifyDbChange()
  },
}

export { PaymentConflictError, installmentRepo }
