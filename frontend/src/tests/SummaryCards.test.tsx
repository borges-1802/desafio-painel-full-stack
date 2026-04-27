import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { useQuery } from '@tanstack/react-query'
import SummaryCards from '@/components/dashboard/SummaryCards'

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query')
  return { ...actual, useQuery: vi.fn() }
})

const mockSummary = {
  total: 25,
  revisados: 4,
  com_alertas: 17,
  alertas_por_area: { saude: 8, educacao: 9, assistencia_social: 8 },
  detalhes_alertas: { saude: [], educacao: [], assistencia_social: [] },
  por_bairro: [],
  insights: [],
}

describe('SummaryCards', () => {
  test('renderiza 4 skeletons durante carregamento', () => {
    vi.mocked(useQuery).mockReturnValue({
      isLoading: true, isError: false, data: undefined,
    } as any)
    const { container } = render(<SummaryCards />)

    expect(screen.queryByText('Total de crianças')).not.toBeInTheDocument()
    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(4)
  })

  test('renderiza mensagem de erro quando query falha', () => {
    vi.mocked(useQuery).mockReturnValue({
      isLoading: false, isError: true, data: undefined,
    } as any)
    render(<SummaryCards />)

    expect(screen.getByText('Erro ao carregar resumo.')).toBeInTheDocument()
  })

  test('renderiza os 4 cards com títulos corretos', () => {
    vi.mocked(useQuery).mockReturnValue({
      isLoading: false, isError: false, data: mockSummary,
    } as any)
    render(<SummaryCards />)

    expect(screen.getByText('Total de crianças')).toBeInTheDocument()
    expect(screen.getByText('Crianças com alertas')).toBeInTheDocument()
    expect(screen.getByText('Casos Revisados')).toBeInTheDocument()
    expect(screen.getByText('Casos Pendentes')).toBeInTheDocument()
  })

  test('exibe os valores corretos de cada KPI', () => {
    vi.mocked(useQuery).mockReturnValue({
      isLoading: false, isError: false, data: mockSummary,
    } as any)
    render(<SummaryCards />)

    expect(screen.getByText('25')).toBeInTheDocument()  // total
    expect(screen.getByText('17')).toBeInTheDocument()  // com_alertas
    expect(screen.getByText('4')).toBeInTheDocument()   // revisados
    expect(screen.getByText('21')).toBeInTheDocument()  // pendentes: 25 - 4
  })

  test('calcula casos pendentes como total - revisados', () => {
    vi.mocked(useQuery).mockReturnValue({
      isLoading: false, isError: false,
      data: { ...mockSummary, total: 10, revisados: 3 },
    } as any)
    render(<SummaryCards />)

    expect(screen.getByText('7')).toBeInTheDocument()
  })

  test('card total linka para /children', () => {
    vi.mocked(useQuery).mockReturnValue({
      isLoading: false, isError: false, data: mockSummary,
    } as any)
    render(<SummaryCards />)

    expect(screen.getByText('Total de crianças').closest('a'))
      .toHaveAttribute('href', '/children')
  })

  test('card de alertas linka para /children?alertas=true', () => {
    vi.mocked(useQuery).mockReturnValue({
      isLoading: false, isError: false, data: mockSummary,
    } as any)
    render(<SummaryCards />)

    expect(screen.getByText('Crianças com alertas').closest('a'))
      .toHaveAttribute('href', '/children?alertas=true')
  })

  test('card de revisados linka para /children?revisado=true', () => {
    vi.mocked(useQuery).mockReturnValue({
      isLoading: false, isError: false, data: mockSummary,
    } as any)
    render(<SummaryCards />)

    expect(screen.getByText('Casos Revisados').closest('a'))
      .toHaveAttribute('href', '/children?revisado=true')
  })

  test('card de pendentes linka para /children?revisado=false', () => {
    vi.mocked(useQuery).mockReturnValue({
      isLoading: false, isError: false, data: mockSummary,
    } as any)
    render(<SummaryCards />)

    expect(screen.getByText('Casos Pendentes').closest('a'))
      .toHaveAttribute('href', '/children?revisado=false')
  })
})