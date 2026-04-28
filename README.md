# Painel de Monitoramento - Prefeitura do Rio de Janeiro

Sistema de monitoramento de crianças em situação de vulnerabilidade social. Permite que técnicos municipais visualizem, filtrem e revisem casos a partir de dados integrados de três áreas: saúde, educação e assistência social.

> A documentação está resumida aqui, porém também está descrita detalhadamente nas pastas.


## Acesso online

| Serviço | URL |
|---|---|
| Frontend | https://desafio-painel-prefeitura-jvborges.vercel.app/ |
| Backend | https://desafio-painel-full-stack.onrender.com/ |


## Aviso importante - cold start do backend

O backend está hospedado no **Render (plano gratuito)**, elas hibernam após 15 minutos de inatividade e levam **até 60 segundos para acordar** na primeira requisição. Seria interessante acessar primeiro ao site do backend para que ele seja acordado.

Se a interface carregar mas os dados não aparecerem, aguarde cerca de 1 minuto e recarregue a página. As requisições seguintes serão normais.

---

## Como rodar

### Com Docker (recomendado)

Primeiro instale as dependências no `frontend` e no `backend`.
```bash
cd frontend
npm install
cd ..
cd backend
npm install
```
E depois inicie o docker.

```bash
docker compose up --build
```

Caso dê erro de dependência, faça o seguinte procedimento:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install # reinstala package.json corretamente
cd ..
cd backend
rm -rf node_modules package-lock.json
npm install # reinstala package.json corretamente
cd ..
docker compose up --build
```

| Serviço | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend | http://localhost:3001 |

### Sem Docker

```bash
# Terminal 1 - backend
cd backend
npm install
cp .env.example .env   # ajuste JWT_SECRET
npm run dev

# Terminal 2 - frontend
cd frontend
npm install
npm run dev
```

**Credenciais de acesso:**
```
E-mail: tecnico@prefeitura.rio
Senha:  painel@2024
```

---

## Visão geral da arquitetura

```
┌─────────────────────────────────────────────────────┐
│                     Docker Compose                  │
│                                                     │
│  ┌──────────────────┐      ┌──────────────────────┐ │
│  │  Next.js 16      │      │  Express 5           │ │
│  │  (standalone)    │─────▶│  + better-sqlite3    │ │
│  │  :3000           │      │  :3001               │ │
│  └──────────────────┘      └──────────────────────┘ │
│                                      │              │
│                              ┌───────▼──────┐       │
│                              │  banco.db    │       │
│                              │  (volume)    │       │
│                              └──────────────┘       │
└─────────────────────────────────────────────────────┘
```

O frontend consome a API diretamente do browser - não há BFF nem proxy intermediário. O backend é stateless exceto pelo arquivo SQLite, que é persistido em volume Docker.

---

## Stack de tecnologias

### Backend
| Camada | Tecnologia | Motivo |
|---|---|---|
| Framework | Express 5 | Maduro, mínimo, sem opinião |
| Banco de dados | SQLite (better-sqlite3) | Sem servidor separado, fácil no Docker |
| Autenticação | JWT (jsonwebtoken) | Stateless, sem necessidade de sessão |
| Testes | Jest + Supertest | Padrão do ecossistema Node |

### Frontend
| Camada | Tecnologia | Motivo |
|---|---|---|
| Framework | Next.js 16 (App Router) | SSR, roteamento, middleware nativo |
| Linguagem | TypeScript | Segurança de tipos ponta a ponta |
| UI | shadcn/ui + Tailwind CSS v4 | Componentes acessíveis, sem CSS-in-JS |
| Formulários | react-hook-form + Zod | Validação declarativa com inferência de tipos |
| Data fetching | TanStack React Query v5 | Cache, revalidação e estados de loading/error |
| HTTP | Axios | Interceptors e tipagem de resposta |
| Gráficos | Recharts | Integração nativa com React |
| Mapa | Leaflet | Leve, sem API key, funciona offline |
| Testes unitários | Vitest + Testing Library | Compatível com Vite, API idêntica ao Jest |
| Testes E2E | Playwright | Suporte a multi-browser e mobile nativo |

---

## Decisões arquiteturais e trade-offs

### Banco de dados: SQLite em vez de PostgreSQL

O PostgreSQL foi considerado inicialmente, mas o SQLite foi escolhido pelos seguintes motivos:

- **Sem servidor separado** - o Docker Compose ficaria com três serviços (backend, frontend, postgres) em vez de dois
- **Volume de dados pequeno** - 25 registros no seed, sem necessidade de concorrência de escrita
- **WAL mode habilitado** - `db.pragma('journal_mode = WAL')` permite leituras concorrentes sem bloquear escritas
- **Portabilidade** - o banco é um arquivo único persistido em volume Docker

**Trade-off aceito:** SQLite não escala bem para múltiplos writers simultâneos. Em produção real, com dezenas de técnicos atualizando registros ao mesmo tempo, o PostgreSQL, no qual já possuo experiência, seria a escolha correta.

---

### Armazenamento dos dados das áreas como JSON

Os campos `saude`, `educacao` e `assistencia_social` são colunas `TEXT` que armazenam JSON, em vez de tabelas normalizadas separadas.

**Motivação:**
- Os dados de cada área sempre são lidos e escritos juntos - não há consulta parcial
- A estrutura de cada área é semi-estruturada e varia entre registros (campos opcionais, alertas variáveis)
- Evita JOINs desnecessários para um volume pequeno de dados

**Trade-off aceito:** não é possível filtrar por subcampos via SQL (ex: `WHERE saude->>'vacinas' = 'em_dia'`). Todos os filtros por tipo de alerta e área são feitos em memória no controller. Aceitável com 25 registros, problemático com milhares.

---

### Autenticação: JWT em cookie em vez de localStorage

O token JWT é armazenado em cookie com `SameSite=Strict` em vez de `localStorage`.

**Motivação:**
- O middleware do Next.js (`middleware.ts`) roda no servidor e só tem acesso a cookies, não ao `localStorage`
- Permite redirecionar para `/login` antes de qualquer renderização, sem flash de conteúdo protegido
- `SameSite=Strict` mitiga ataques CSRF

**Limitação conhecida:** o middleware verifica apenas a *presença* do cookie, não a validade criptográfica do JWT. A validação real ocorre na primeira chamada à API (que retorna 401). Optamos por não replicar a verificação de assinatura no middleware para evitar duplicar a `JWT_SECRET` no contexto do Edge Runtime - em produção, o ideal seria usar `jose` (compatível com Edge) para validar o token no próprio middleware.

---

### Proteção de rotas: middleware server-side

A proteção de rotas é feita inteiramente no `middleware.ts` do Next.js, que intercepta requisições antes da renderização.

```
Requisição → middleware.ts → tem cookie? → não → redirect /login
                                         → sim → renderiza a página
```

**Trade-off aceito:** não há proteção client-side adicional. Se o cookie for forjado, a página renderiza - mas a primeira chamada à API retorna 401, e o frontend trata isso redirecionando para `/login`.

---

### Endpoint de resumo: loop único

O `GET /summary` calcula todas as métricas (totais, alertas por área, agrupamento por bairro, insights) em **um único loop** sobre os registros, em vez de múltiplos `.filter()` e `.reduce()` separados.

**Motivação:** com N métricas calculadas separadamente, o custo seria O(N × registros). Com loop único, é O(registros) independente do número de métricas.

**Trade-off aceito:** o código do controller é mais denso e menos declarativo do que seria com `.filter()` encadeados. Com 25 registros a diferença de performance é imperceptível - a escolha documenta uma intenção arquitetural mais do que uma necessidade imediata.

---

### Filtragem em memória vs. SQL

Os filtros da listagem (`/children`) são aplicados em memória após buscar todos os registros do banco, em vez de construir queries SQL dinâmicas com cláusulas `WHERE`.

**Motivação:**
- Evita SQL injection por construção dinâmica de string
- Simplifica o código - sem biblioteca de query builder
- A busca por nome com normalização de acentos (`NFD`) não é suportada nativamente pelo SQLite sem extensão

**Trade-off aceito:** a cada requisição, todos os registros são carregados em memória. Com 25 crianças é negligenciável; com 25.000 seria inviável e exigiria SQL parametrizado com paginação no banco.

---

### Identidade visual

A interface usa o azul institucional da Prefeitura do Rio (`#005B9A`) e a fonte **Inter**, que é open-source, de alta legibilidade e é ideal para pessoas que possam ter alguma dificulade. A fonte oficial da marca (Cera Pro) é proprietária e paga, o que inviabilizaria o uso em um desafio técnico.

---

## Tratamento de dados incompletos

Crianças podem ter qualquer combinação de áreas preenchidas ou ausentes (`null`). O sistema trata esse cenário em todas as camadas:

- **Backend:** `parseChild()` faz `JSON.parse` apenas se o campo não for `null`; alertas são calculados com `Array.isArray(c.saude?.alertas)`
- **Frontend:** cada seção de detalhe exibe "Sem dados de [área] cadastrados" quando o campo é `null`
- **Testes E2E:** cobrem explicitamente `c003` (educação `null`) e `c015` (todas as três áreas `null`)

---

## Segurança

| Ponto | Implementação |
|---|---|
| Autenticação | JWT assinado com `JWT_SECRET`, expira em 8h |
| Proteção de rotas | Middleware server-side antes da renderização |
| Transmissão do token | Header `Authorization: Bearer` nas chamadas à API |
| CSRF | Cookie com `SameSite=Strict` |
| SQL injection | Prepared statements (`better-sqlite3`) em todas as queries |
| Validação de entrada | Verificação de tipos nos query params (`page`, `limit`) |

**Limitações conhecidas:** sem rate limiting na rota de login (vulnerável a brute force), sem restrição de origem no CORS, credenciais hardcoded no código (deveriam ser variáveis de ambiente).

---

## Testes

### Backend (Jest + Supertest)

```bash
cd backend && npm test
```

Os testes usam um banco SQLite **em memória** - o `banco.db` real não é afetado.

| Arquivo | O que cobre |
|---|---|
| `auth.test.js` | Login, geração de token, credenciais inválidas |
| `children.test.js` | Listagem, filtros, paginação, detalhe, revisão |
| `summary.test.js` | Totais, alertas por área, bairros, insights |
| `utils.test.js` | Cálculo de idade |

### Frontend - Unitários (Vitest + Testing Library)

```bash
cd frontend && npm run test:run
```

| Arquivo | O que cobre |
|---|---|
| `LoginPage.test.tsx` | Validação de formulário, submissão, erro de credenciais |
| `SummaryCards.test.tsx` | Renderização dos cards com dados mockados |
| `ChildrenFilters.test.tsx` | Aplicação e limpeza de filtros |
| `Pagination.test.tsx` | Navegação entre páginas |
| `ReviewActionCard.test.tsx` | Fluxo de revisão completo |

### Frontend - E2E (Playwright)

```bash
# Com a aplicação rodando
cd frontend && npm run test:e2e
```

Projetos: **chromium** (Desktop Chrome) e **mobile** (Pixel 5).

| Arquivo | O que cobre |
|---|---|
| `auth.spec.ts` | Login, logout, redirecionamentos, validações |
| `dashboard.spec.ts` | Cards de resumo, links de navegação |
| `children.spec.ts` | Lista, filtros, busca, paginação |
| `child-detail.spec.ts` | Detalhe completo, dados parciais, sem dados, revisão |

---
---

## Gestão de estado e comunicação com a API

O frontend usa **TanStack React Query** como camada de cache e sincronização com a API. Não há Redux nem Context API para estado de servidor - o React Query resolve isso de forma mais simples.

### Como funciona na prática

```
Componente → useQuery(key, fetchFn) → React Query cache
                                           ↓ cache hit → dados imediatos
                                           ↓ cache miss → fetch → atualiza cache
```

- **`useQuery`** para leitura (dashboard, lista, detalhe)
- **`useMutation`** para a ação de revisão, com `invalidateQueries` para revalidar o detalhe da criança após sucesso
- **`staleTime`** configurado por query - dados do resumo ficam frescos por mais tempo que a lista

### Filtros como estado de URL

Os filtros da listagem (`/children`) são armazenados como query params na URL em vez de estado local (`useState`). Isso significa:

- A URL é compartilhável - `/children?bairro=Rocinha&alertas=true` abre a lista já filtrada
- O botão Voltar do browser restaura os filtros anteriores
- Os cards do dashboard que linkam para `/children?alertas=true` e `/children?revisado=false` funcionam naturalmente

**Trade-off aceito:** a lógica de sincronização entre URL e estado dos selects é ligeiramente mais complexa do que `useState` simples.

---

## Componentização e modularidade

### Organização por domínio

Os componentes estão organizados por domínio de negócio, não por tipo técnico:

```
components/
├── dashboard/      # Tudo que pertence ao /dashboard
├── children/       # Tudo que pertence à listagem
├── childrenId/     # Tudo que pertence ao detalhe
├── shared/         # Sidebar, Header - usados em múltiplas páginas
└── ui/             # Primitivos shadcn/ui (Button, Dialog, etc.)
```

Essa estrutura evita o anti-padrão de pastas como `components/forms/` ou `components/cards/` que agrupam por formato em vez de por função.

### Separação de responsabilidades no detalhe da criança

A página `/children/[id]` é composta por seções independentes, cada uma responsável por uma área:

| Componente | Responsabilidade |
|---|---|
| `HealthSection` | Exibe dados e alertas de saúde |
| `EducationSection` | Exibe dados e alertas de educação |
| `SocialSection` | Exibe dados e alertas de assistência social |
| `ReviewActionCard` | Gerencia o estado de revisão (botão, diálogo, toast) |
| `DetailShared` | Componente `NoDados` reutilizado pelas três seções |

Cada seção recebe apenas os dados de que precisa - nenhuma seção conhece as outras.

### Integração frontend-backend via tipos compartilhados

Os tipos TypeScript em `src/types/index.ts` espelham o contrato da API. Qualquer mudança no formato de resposta do backend quebra a compilação do frontend - o que força consistência entre as duas camadas sem precisar de um schema GraphQL ou OpenAPI formal.

---

## Usabilidade e responsividade

### Interface adaptada para uso em campo

O painel foi desenhado para técnicos que podem acessar de desktops institucionais ou dispositivos móveis:

- **Sidebar retrátil** - no desktop é fixa; no mobile vira um Sheet (gaveta lateral) acionado por botão de menu
- **Alternância tabela/cards** - a lista de crianças pode ser visualizada em tabela (desktop) ou cards empilhados (mobile)
- **Debounce na busca** - o campo de nome aguarda 400ms após a última tecla antes de filtrar, evitando requisições a cada caractere

### Dark mode

Suporte completo a tema escuro via `next-themes`, com persistência da preferência do usuário. Os tokens de cor do Tailwind respeitam `prefers-color-scheme` por padrão.

### Acessibilidade

- Componentes shadcn/ui são baseados em Radix UI, que implementa as especificações ARIA (diálogos, selects, navegação por teclado)
- Labels com `sr-only` nos campos do formulário de login (visíveis para leitores de tela, ocultos visualmente)
- `role="alert"` no erro de credenciais do login
- Fonte Inter - alta legibilidade em telas de baixa resolução, atende WCAG AA para contraste

### Feedback visual

- **Estados de loading** - esqueletos e spinners durante carregamento de dados
- **Estado vazio** - mensagem "Nenhuma criança encontrada" quando filtros não retornam resultados
- **Toast de sucesso** (Sonner) após confirmar revisão
- **Diálogo de confirmação** antes de ações irreversíveis (revisão de caso)


## O que faria diferente com mais tempo

### Backend

**Migrar para PostgreSQL em produção**
O SQLite foi uma escolha pragmática para o desafio, mas em produção real trocaria por PostgreSQL. Com múltiplos técnicos editando registros simultaneamente, o SQLite com WAL mode começa a apresentar contenção de escrita. O PostgreSQL também permitiria filtros via SQL em vez de filtragem em memória, tornando a paginação correta e eficiente mesmo com milhares de registros.

**Validação de entrada com Zod (ou Joi)**
Hoje o corpo do `POST /auth/token` não é validado - se chegarem campos inesperados ou em formato errado, o comportamento é indefinido. Adicionaria um schema Zod para validar e tipar todos os bodies de requisição antes de chegar no controller.

**Middleware global de erro**
Cada controller trata seus próprios erros individualmente. Centralizaria isso em um `app.use((err, req, res, next) => ...)` para respostas de erro consistentes e sem repetição.

**Rate limiting na rota de login**
`express-rate-limit` com no máximo 10 tentativas por IP em 15 minutos eliminaria o risco de brute force nas credenciais.

**Credenciais como variáveis de ambiente**
O e-mail e senha do técnico estão hardcoded em `authController.js`. Em produção moveriam para `.env` e o `JWT_SECRET` nunca estaria exposto no `docker-compose.yml`.

**Logs estruturados**
Adicionaria Winston ou Pino para logging estruturado (JSON), facilitando auditoria de acessos e diagnóstico de erros em produção.

---

### Frontend

**Validação do JWT no middleware**
Hoje o `middleware.ts` verifica apenas a presença do cookie, não sua validade. Com a biblioteca `jose` (compatível com Edge Runtime) seria possível verificar a assinatura do token no próprio middleware, rejeitando tokens expirados ou adulterados antes de renderizar qualquer página.

**Testes de acessibilidade automatizados**
Integraria `axe-playwright` nos testes E2E para capturar regressões de acessibilidade automaticamente a cada push.

**Cobertura de testes unitários**
Hoje há 5 arquivos de testes de componentes. Expandiria para cobrir as seções de detalhe (`HealthSection`, `EducationSection`, `SocialSection`), o mapa de calor e os estados de loading/error das páginas.

**CI/CD com GitHub Actions**
Adicionaria um workflow que rode `npm test` (backend), `npm run test:run` (frontend) e `npm run test:e2e` a cada pull request, bloqueando merge se qualquer suíte falhar.

**Paginação correta no banco**
Hoje `LIMIT` e `OFFSET` são aplicados em memória após buscar todos os registros. Com PostgreSQL e queries parametrizadas, a paginação aconteceria no banco - `SELECT ... LIMIT $1 OFFSET $2` - o que seria obrigatório com volumes maiores de dados.

---

## Estrutura do repositório

```
desafio-painel-full-stack/
├── backend/          # API REST (Node.js + Express + SQLite)
│   └── README.md     # Documentação do backend
├── frontend/         # Interface web (Next.js + TypeScript)
│   └── README.md     # Documentação do frontend
└── docker-compose.yml
```