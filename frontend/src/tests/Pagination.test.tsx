import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Pagination } from '@/components/children/Pagination'

describe('Pagination', () => {
  test('renderiza todos os botões para totalPages <= 7', () => {
    render(<Pagination currentPage={1} totalPages={5} onPageChange={vi.fn()} />)

    expect(screen.getByLabelText('Ir para página 1')).toBeInTheDocument()
    expect(screen.getByLabelText('Ir para página 5')).toBeInTheDocument()
  })

  test('desabilita botão anterior na primeira página', () => {
    render(<Pagination currentPage={1} totalPages={5} onPageChange={vi.fn()} />)

    expect(screen.getByLabelText('Página anterior')).toBeDisabled()
    expect(screen.getByLabelText('Próxima página')).not.toBeDisabled()
  })

  test('desabilita botão próximo na última página', () => {
    render(<Pagination currentPage={5} totalPages={5} onPageChange={vi.fn()} />)

    expect(screen.getByLabelText('Próxima página')).toBeDisabled()
    expect(screen.getByLabelText('Página anterior')).not.toBeDisabled()
  })

  test('chama onPageChange com a página correta ao clicar', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()
    render(<Pagination currentPage={1} totalPages={5} onPageChange={onPageChange} />)

    await user.click(screen.getByLabelText('Ir para página 3'))
    expect(onPageChange).toHaveBeenCalledWith(3)
  })

  test('chama onPageChange ao avançar página', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()
    render(<Pagination currentPage={2} totalPages={5} onPageChange={onPageChange} />)

    await user.click(screen.getByLabelText('Próxima página'))
    expect(onPageChange).toHaveBeenCalledWith(3)
  })

  test('chama onPageChange ao voltar página', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()
    render(<Pagination currentPage={3} totalPages={5} onPageChange={onPageChange} />)

    await user.click(screen.getByLabelText('Página anterior'))
    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  test('marca página atual com aria-current="page"', () => {
    render(<Pagination currentPage={3} totalPages={5} onPageChange={vi.fn()} />)

    expect(screen.getByLabelText('Ir para página 3')).toHaveAttribute('aria-current', 'page')
    expect(screen.getByLabelText('Ir para página 1')).not.toHaveAttribute('aria-current')
  })

  test('exibe texto informativo da página atual', () => {
    render(<Pagination currentPage={2} totalPages={5} onPageChange={vi.fn()} />)

    expect(screen.getByText('Página 2 de 5')).toBeInTheDocument()
  })

  test('exibe ellipsis para muitas páginas', () => {
    render(<Pagination currentPage={5} totalPages={10} onPageChange={vi.fn()} />)

    expect(screen.getAllByText('…').length).toBeGreaterThanOrEqual(1)
  })

  test('não chama onPageChange ao clicar em botão desabilitado', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()
    render(<Pagination currentPage={1} totalPages={5} onPageChange={onPageChange} />)

    await user.click(screen.getByLabelText('Página anterior'))
    expect(onPageChange).not.toHaveBeenCalled()
  })
})