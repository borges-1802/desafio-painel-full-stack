import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { ReviewActionCard } from '@/components/childrenId/ReviewActionCard'

describe('ReviewActionCard', () => {
  test('renderiza botão de confirmar revisão', () => {
    render(<ReviewActionCard onReview={vi.fn()} />)

    expect(screen.getByRole('button', { name: /confirmar revisão/i })).toBeInTheDocument()
  })

  test('exibe descrição do card', () => {
    render(<ReviewActionCard onReview={vi.fn()} />)

    expect(screen.getByText(/confirmar revisão do caso/i)).toBeInTheDocument()
  })

  test('abre dialog ao clicar no botão', async () => {
    const user = userEvent.setup()
    render(<ReviewActionCard onReview={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: /confirmar revisão/i }))

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText(/tem certeza que deseja marcar/i)).toBeInTheDocument()
  })

  test('fecha dialog ao clicar em Cancelar', async () => {
    const user = userEvent.setup()
    render(<ReviewActionCard onReview={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: /confirmar revisão/i }))
    await user.click(screen.getByRole('button', { name: /cancelar/i }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  test('não chama onReview ao abrir o dialog sem confirmar', async () => {
    const user = userEvent.setup()
    const onReview = vi.fn()
    render(<ReviewActionCard onReview={onReview} />)

    await user.click(screen.getByRole('button', { name: /confirmar revisão/i }))

    expect(onReview).not.toHaveBeenCalled()
  })

  test('chama onReview e fecha dialog ao clicar em Confirmar', async () => {
    const user = userEvent.setup()
    const onReview = vi.fn()
    render(<ReviewActionCard onReview={onReview} />)

    await user.click(screen.getByRole('button', { name: /confirmar revisão/i }))
    await user.click(screen.getByRole('button', { name: 'Confirmar' }))

    expect(onReview).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  test('desabilita botão e exibe "Salvando..." quando isLoading=true', () => {
    render(<ReviewActionCard onReview={vi.fn()} isLoading />)

    const button = screen.getByRole('button', { name: /salvando/i })
    expect(button).toBeDisabled()
    expect(screen.getByText('Salvando...')).toBeInTheDocument()
  })

  test('não abre dialog quando isLoading=true', async () => {
    const user = userEvent.setup()
    render(<ReviewActionCard onReview={vi.fn()} isLoading />)

    await user.click(screen.getByRole('button', { name: /salvando/i }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})