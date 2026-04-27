import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginPage from '@/app/(auth)/login/page'
import { authApi } from '@/lib/api'

const mockReplace = vi.hoisted(() => vi.fn())

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
}))

vi.mock('@/lib/api', () => ({
  authApi: { login: vi.fn() },
}))

vi.mock('@/lib/auth', () => ({
  setToken: vi.fn(),
  hasToken: vi.fn(() => false),
  removeToken: vi.fn(),
  useToken: vi.fn(() => undefined),
}))

describe('LoginPage', () => {
  beforeEach(() => {
    mockReplace.mockClear()
    vi.mocked(authApi.login).mockClear()
  })

  test('renderiza campos de email, senha e botão de entrar', () => {
    render(<LoginPage />)

    expect(screen.getByPlaceholderText('E-mail')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Senha')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument()
  })

  test('exibe erro de validação para email inválido', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)

    await user.type(screen.getByPlaceholderText('E-mail'), 'emailinvalido')
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    expect(await screen.findByText('E-mail inválido')).toBeInTheDocument()
  })

  test('exibe erro de validação para senha vazia', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)

    await user.type(screen.getByPlaceholderText('E-mail'), 'tecnico@prefeitura.rio')
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    expect(await screen.findByText('Senha obrigatória')).toBeInTheDocument()
  })

  test('redireciona para /dashboard após login com sucesso', async () => {
    const user = userEvent.setup()
    vi.mocked(authApi.login).mockResolvedValue({ token: 'fake-jwt' })
    render(<LoginPage />)

    await user.type(screen.getByPlaceholderText('E-mail'), 'tecnico@prefeitura.rio')
    await user.type(screen.getByPlaceholderText('Senha'), 'painel@2024')
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/dashboard'))
  })

  test('exibe mensagem de erro com credenciais inválidas', async () => {
    const user = userEvent.setup()
    vi.mocked(authApi.login).mockRejectedValue(new Error('Credenciais inválidas'))
    render(<LoginPage />)

    await user.type(screen.getByPlaceholderText('E-mail'), 'tecnico@prefeitura.rio')
    await user.type(screen.getByPlaceholderText('Senha'), 'errada')
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Credenciais inválidas')
  })

  test('desabilita botão e exibe "Entrando..." durante submissão', async () => {
    const user = userEvent.setup()
    vi.mocked(authApi.login).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ token: 'fake' }), 100))
    )
    render(<LoginPage />)

    await user.type(screen.getByPlaceholderText('E-mail'), 'tecnico@prefeitura.rio')
    await user.type(screen.getByPlaceholderText('Senha'), 'painel@2024')
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    expect(screen.getByRole('button', { name: /entrando/i })).toBeDisabled()
  })
})