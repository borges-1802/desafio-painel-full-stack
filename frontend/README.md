# Painel de Monitoramento - Frontend

Interface web do sistema de monitoramento de crianças em situação de vulnerabilidade social da Prefeitura do Rio de Janeiro. Desenvolvida em Next.js 16 com App Router, TypeScript e shadcn/ui.

|Camada | Tecnologia |
|---|---|
| Framework | Next.js 16 |
| Linguagem | TypeScript |
| Estilização | Tailwind CSS v4 + shadcn/ui (Radix UI) |
| Formulários | react-hook-form + Zod |
| Data fetching | TanStack React Query v5 |
| HTTP client | Axios |
| Gráficos | Recharts |
| Mapa de calor | Leaflet |
| Toasts | Sonner |
| Temas | next-themes (dark mode) |
| Testes unitários | Vitest + Testing Library |
| Testes E2E | Playwright |

## Pré-requisitos

- Node.js 18+, npm 9+
- Backend rodando em `http://localhost:3001` (veja `/backend`)

## Instalação e execução

```bash
# Instalar dependências
npm install

# Instalar os browsers do Playwright (apenas para testes E2E)
npx playwright install chromium

# Modo desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Scripts disponíveis

```bash
npm run dev           # Servidor de desenvolvimento
npm run build         # Build de produção
npm run start         # Servidor de produção (requer build)
npm run lint          # Verificação de lint (ESLint)
npm run test          # Testes unitários em modo watch (Vitest)
npm run test:run      # Testes unitários uma única vez
npm run test:e2e      # Testes E2E (Playwright, requer app rodando)
npm run test:e2e:ui   # Testes E2E com interface visual
npm run test:e2e:report # Abre o relatório HTML do último run E2E
```

## Variáveis de ambiente

Crie um arquivo `.env.local` na raiz da pasta `frontend`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Em produção via Docker Compose, essa variável é injetada automaticamente.

## Estrutura de pastas

```
frontend/
├── e2e/                        # Testes Playwright
│   ├── auth.spec.ts
│   ├── dashboard.spec.ts
│   ├── children.spec.ts
│   ├── child-detail.spec.ts
│   └── helpers.ts
├── src/
│   ├── app/
│   │   ├── (auth)/login/       # Página de login (rota pública)
│   │   └── (protected)/        # Rotas autenticadas
│   │       ├── dashboard/
│   │       └── children/
│   │           └── [id]/
│   ├── components/
│   │   ├── ui/                 # Componentes shadcn/ui
│   │   ├── shared/             # Componentes compartilhados (Sidebar, Header)
│   │   ├── dashboard/          # Cards de resumo, gráficos, mapa
│   │   ├── children/           # Lista, filtros, paginação
│   │   └── childrenId/         # Seções de detalhe (saúde, educação, etc.)
│   ├── lib/
│   │   ├── api.ts              # Funções de chamada à API
│   │   ├── auth.ts             # Gerenciamento de token (cookie)
│   │   ├── transform.ts        # Funções para exportar ao front
│   │   └── utils.ts            # Função de calcular idade centralizada
│   ├── types/
│   │   └── index.ts            # Tipos TypeScript globais
│   │── tests/                  # Testes unitários de componentes
│   └── middleware.ts           # Proteção de rotas (redirect para /login)            
├── playwright.config.ts
└── next.config.ts
```

## Autenticação

O token JWT é armazenado em cookie HTTP com as seguintes propriedades:
- `path=/` - disponível em toda a aplicação
- `max-age=60 * 60 * 80` - expira em 8 horas
- `SameSite=Strict` - proteção contra CSR

O `middleware.ts` redireciona para `/login` qualquer rota protegida sem cookie de token. A validação real do JWT ocorre no backend a cada requisição autenticada.

**Credenciais de acesso (seed):**
```
E-mail: tecnico@prefeitura.rio
Senha:  painel@2024
```

## Páginas

### `/login`
Formulário de autenticação com validação via Zod. Redireciona para `/dashboard` após login bem-sucedido ou se o usuário já estiver autenticado.

### `/dashboard`
Visão geral com:
- Cards de resumo (total de crianças, com alertas, casos revisados, casos pendentes) com links para lista filtrada
- Gráfico de barras com alertas por área (saúde, educação, assistência social)
- Mapa de calor por bairro (Leaflet)
- Cards de insights automáticos gerados pelo backend

### `/children`
Lista paginada com filtros:
- Busca por nome (debounced)
- Filtro por bairro, área de alerta, tipo de alerta, faixa etária
- Filtro por status (com alertas / revisado / pendente)
- Ordenação por nome
- Alternância entre visualização em tabela e cards
- Paginação com 10 itens por página

### `/children/[id]`
Detalhe da criança com:
- Dados cadastrais (nome, bairro, responsável, idade)
- Seção de Saúde (vacinas, consultas, alertas)
- Seção de Educação (matrícula, frequência, alertas)
- Seção de Assistência Social (benefícios, alertas)
- Exibe "Sem dados" para áreas sem registro
- Card de revisão: status atual, botão "Confirmar revisão" (caso pendente) ou dados do técnico que revisou (caso revisado)
- Diálogo de confirmação antes de registrar revisão, com toast de sucesso via Sonner

## Testes

### Unitários (Vitest + Testing Library)

Cobrem os principais componentes de forma isolada:
```
bash
npm run test:run
```

Arquivos em `src/tests/`:
- `LoginPage.test.tsx` - validação de formulário, submissão, erro de credenciais
- `SummaryCards.test.tsx` - renderização dos cards com dados mockados
- `ChildrenFilters.test.tsx` - aplicação e limpeza de filtros
- `Pagination.test.tsx` - navegação entre páginas
- `ReviewActionCard.test.tsx` - fluxo de revisão (botão, diálogo, confirmação)

### E2E (Playwright)

Testam o fluxo completo contra a aplicação rodando (dev ou Docker):

```
bash
# Com a aplicação rodando em localhost:3000
npm run test:e2e
```

Projetos configurados: **chromium** (Desktop Chrome) e **mobile** (Pixel 5).

### Arquivos em `e2e/`:
- `auth.spec.ts` - login, logout, redirecionamentos, validações de formulário
- `dashboard.spec.ts` - cards de resumo, links, navegação
- `children.spec.ts` - lista, filtros por URL, busca, paginação
- `child-detail.spec.ts` - detalhe completo, dados parciais, sem dados, fluxo de revisão

Para rodar contra o Docker:
```bash
BASE_URL=http://localhost:3000 npm run test:e2e
```