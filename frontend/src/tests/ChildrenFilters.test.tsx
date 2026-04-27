import { render, screen, act, within, fireEvent } from '@testing-library/react'
import ChildrenFiltersComponent from '@/components/children/ChildrenFilters'
import type { ChildrenFilters } from '@/types'

vi.mock('@/components/ui/select', () => ({
  Select: ({ children, onValueChange, value }: any) => (
    <select value={value} onChange={(e) => onValueChange?.(e.target.value)}>
      {children}
    </select>
  ),
  SelectTrigger: () => null,
  SelectValue: () => null,
  SelectContent: ({ children }: any) => <>{children}</>,
  SelectItem: ({ children, value }: any) => <option value={value}>{children}</option>,
}))

const defaultFilters: ChildrenFilters = { page: 1 }

describe('ChildrenFilters', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  test('renderiza campo de busca por nome', () => {
    render(<ChildrenFiltersComponent filters={defaultFilters} onChange={vi.fn()} />)

    expect(screen.getByPlaceholderText('Buscar por nome...')).toBeInTheDocument()
  })

  test('debounce: chama onChange somente após 350ms', () => {
    const onChange = vi.fn()
    render(<ChildrenFiltersComponent filters={defaultFilters} onChange={onChange} />)

    fireEvent.change(screen.getByPlaceholderText('Buscar por nome...'), {
      target: { value: 'Ana' },
    })

    expect(onChange).not.toHaveBeenCalled()

    act(() => vi.advanceTimersByTime(350))

    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ nome: 'Ana', page: 1 }))
  })

  test('debounce: não dispara onChange antes dos 350ms', () => {
    const onChange = vi.fn()
    render(<ChildrenFiltersComponent filters={defaultFilters} onChange={onChange} />)

    fireEvent.change(screen.getByPlaceholderText('Buscar por nome...'), {
      target: { value: 'Jo' },
    })

    act(() => vi.advanceTimersByTime(200))
    expect(onChange).not.toHaveBeenCalled()
  })

  test('não exibe badge de contagem sem filtros ativos', () => {
    render(<ChildrenFiltersComponent filters={defaultFilters} onChange={vi.fn()} />)

    expect(screen.queryByText('1')).not.toBeInTheDocument()
  })

  test('exibe badge com contagem correta de filtros ativos', () => {
    render(
      <ChildrenFiltersComponent
        filters={{ ...defaultFilters, bairro: 'Rocinha', alertas: true }}
        onChange={vi.fn()}
      />
    )

    expect(screen.getByText('2')).toBeInTheDocument()
  })

  test('exibe botão Limpar somente quando há filtros ativos', () => {
    const { rerender } = render(
      <ChildrenFiltersComponent filters={defaultFilters} onChange={vi.fn()} />
    )
    expect(screen.queryByText('Limpar')).not.toBeInTheDocument()

    rerender(
      <ChildrenFiltersComponent
        filters={{ ...defaultFilters, bairro: 'Rocinha' }}
        onChange={vi.fn()}
      />
    )
    expect(screen.getByText('Limpar')).toBeInTheDocument()
  })

  test('reset chama onChange limpando todos os filtros', () => {
    const onChange = vi.fn()
    render(
      <ChildrenFiltersComponent
        filters={{ ...defaultFilters, bairro: 'Rocinha', alertas: true }}
        onChange={onChange}
      />
    )

    fireEvent.click(screen.getByText('Limpar'))
    expect(onChange).toHaveBeenCalledWith({ page: 1, limit: undefined })
  })

  test('exibe tag para filtro de bairro ativo', () => {
    render(
      <ChildrenFiltersComponent
        filters={{ ...defaultFilters, bairro: 'Rocinha' }}
        onChange={vi.fn()}
      />
    )

    expect(screen.getByText('Bairro: Rocinha')).toBeInTheDocument()
  })

  test('remove filtro ao clicar no X da tag', () => {
  const onChange = vi.fn()
  render(
    <ChildrenFiltersComponent
      filters={{ ...defaultFilters, bairro: 'Rocinha' }}
      onChange={onChange}
    />
  )

  const tagSpan = screen.getByText('Bairro: Rocinha').closest('span')!
  fireEvent.click(within(tagSpan).getByRole('button'))

  expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ bairro: undefined }))
  })
})