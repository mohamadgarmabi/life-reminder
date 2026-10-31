// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { InstallmentForm } from './installment-form'

afterEach(cleanup)

describe('InstallmentForm', () => {
  it('shows accessible errors on submit and does not call onSubmit', async () => {
    const onSubmit = vi.fn(async () => {})
    render(<InstallmentForm onSubmit={onSubmit} />)
    await userEvent.click(screen.getByRole('button', { name: 'افزودن قسط' }))
    expect(await screen.findByText('عنوان را وارد کنید')).toBeInTheDocument()
    expect(screen.getByText('مبلغ را وارد کنید')).toBeInTheDocument()
    expect(screen.getByLabelText('عنوان')).toHaveAttribute('aria-invalid', 'true')
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('accepts Persian digits and submits typed values', async () => {
    const onSubmit = vi.fn(async () => {})
    render(<InstallmentForm onSubmit={onSubmit} />)
    await userEvent.type(screen.getByLabelText('عنوان'), 'وام خودرو')
    await userEvent.type(screen.getByLabelText('مبلغ هر قسط'), '۲۵۰۰۰۰۰')
    expect(screen.getByLabelText('مبلغ هر قسط')).toHaveValue('۲٬۵۰۰٬۰۰۰')
    await userEvent.click(screen.getByRole('button', { name: '۷ روز قبل' }))
    await userEvent.click(screen.getByRole('button', { name: 'افزودن قسط' }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce())
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'وام خودرو', amount: 2_500_000, totalPayments: 12, reminderDaysBefore: [0, 1, 7] }),
    )
  })
})
