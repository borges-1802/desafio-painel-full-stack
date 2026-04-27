# Desafio Técnico - Full Stack Pleno da Prefeitura do Rio

Painel interno para monitoramento e acompanhamento de crianças em situação de vulnerabilidade. O sistema consolida dados de Saúde, Educação e Assistência Social em uma interface intuitiva com mapa de calor e insights automáticos.

## Credenciais de acesso

| Campo | Valor |
|-------|-------|
| E-mail | `tecnico@prefeitura.rio` |
| Senha | `painel@2024` |

## Acesso ao site com deploy

| Campo | Valor |
|-------|-------|
| Site | https://desafio-painel-prefeitura-jvborges.vercel.app/ |
| Backend | https://desafio-painel-full-stack.onrender.com/ |

> Primeiro acesso: o backend está no plano gratuito do Render, portanto é necessário esperar pelo menos até 60 segundos, logo após pode dar F5.


## Início rápido com Docker

> Pré-requisito: Docker e Docker Compose instalados.

```bash
git clone https://github.com/borges-1802/desafio-painel-full-stack.git
cd desafio-painel-full-stack
docker compose up --build
```

| Serviço | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend | http://localhost:3001 |

---

## Rodar sem Docker

### Backend

```bash
cd backend
npm install
npm run dev      # porta 3001
```

### Frontend

```bash
cd frontend
npm install
npm run dev      # porta 3000
```

---

## Stack
| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS |
| Componentes UI | shadcn/ui, Radix UI, Lucide React, Sonner |
| Estado / dados | TanStack Query (React Query), Axios |
| Formulários | React Hook Form + Zod |
| Visualização | Leaflet (Mapas), Recharts (Gráfco), Next-Theme |
| Backend | Node.js, Express |
| Banco de Dados | SQLite better-sqlite3 |
| Segurança | JWT + Cookies HttpOnly |
| Testes | Jest + Supertest |

## Testes

### Backend - Jest + Supertest

```bash
cd backend
npm test
```

31 Testes passaram com 4 suítes.

### Frontend - Vitest + React Testing Library

```bash
cd frontend
npm run test:run
```

42 testes de componentes passaram.

---

## Estrutura do banco de dados

Inicialmente o PostgreSQL foi pensado para ser o banco de dados, porém o **SQLite** foi escolhido por não exigir um servidor separado, por funcionar bem no Docker e pelo "pequeno" volume de dados do projeto;

O banco de dados é um arquivo SQLite gerado automaticamente em `data/banco.db` na primeira execução com a criação da tabela children.

Os dados das três áreas de acompanhamento (saúde, educação e assistência social) são armazenados como JSON dentro de colunas TEXT, de forma para simplificar a estrutura do banco, já que os dados são lidos e escritos sempre juntos e o volume de registros é pequeno.

O campo `revisado` é armazenado como inteiro (0 ou 1) pois o SQLite não tem tipo booleano nativo.

## Endpoints

### POST /auth/token
Autentica um técnico e retorna um JWT.

**Body:**
```json
{
  "email": "tecnico@prefeitura.rio",
  "senha": "painel@2024"
}
```

**Resposta:**
```json
{
  "token": "JWT_TOKEN"
}
```

> **Observação:** o campo de senha no body é `senha` (em português).

---

### GET /children
Lista todas as crianças com suporte a filtros e paginação.

**Query params:**
- `bairro` - filtra por bairro
- `alertas=true|false` - filtra crianças com ou sem alertas
- `revisado=true|false` - filtra por status de revisão
- `page` - número da página (padrão: 1)
- `limit` - quantidade por página (padrão: 25)

---

### GET /children/:id
Retorna o detalhe completo de uma criança.

---

### GET /summary
Retorna dados agregados para o painel.

**Resposta:**
```json
{
  "total": 25,
  "revisados": 4,
  "com_alertas": 17,
  "alertas_por_area": {
    "saude": 8,
    "educacao": 9,
    "assistencia_social": 8
  }
}
```

---

### PATCH /children/:id/review
Marca uma criança como revisada. Requer autenticação JWT.

**Resposta:**
```json
{
  "message": "Caso revisado com sucesso",
  "data": { ... }
}
```

---

### Autenticação JWT

A autenticação é feita via JWT (JSON Web Token). O token é gerado no endpoint `POST /auth/token` e deve ser enviado no header `Authorization: Bearer <token>` em todas as rotas protegidas. O token contém `preferred_username`, `iat` (data de geração) e `exp` (data de expiração).

A API retorna mensagens claras para facilitar a integração com o frontend:
- `Token não fornecido`
- `Token inválido`
- `Token expirado`
- `Criança não encontrada`
- `page inválido`
- `limit inválido`

### Como rodar

```bash
cd backend
npm install
npm run dev
```

### Decisões arquiteturais

- **Cookies** ao invés de `localStorage` para armazenar o JWT que é mais seguro e funciona no middleware server-side do Next.js
- **Middleware do Next.js** para proteção de rotas, ele redireciona para `/login` se o token estiver ausente ou expirado, sem depender do client-side
> **Autenticação via cookie no cliente (sem validação no middleware)**
> O middleware verifica apenas a presença do cookie `token`, não a validade do JWT. A validação real ocorre na primeira chamada à API, que retorna 401 e redireciona para o login. Optamos por não replicar a lógica de verificação do JWT no middleware para evitar duplicação — em produção, o ideal seria usar um middleware que valide a assinatura com a mesma `JWT_SECRET`.
- **`auth.ts`** centraliza toda a lógica de token com `getToken`, `setToken`, `removeToken` e `hasToken` em um único lugar
- **Fonte Inter** — escolhida por legibilidade em interfaces institucionais e suporte a acessibilidade (WCAG AA), em detrimento da fonte oficial da Prefeitura Cera Pro que é paga
- **Identidade visual** baseada no Manual de Marca 2025 da Prefeitura do Rio

## Arquitetura do Summary

O endpoint `GET /summary` foi otimizado para calcular todas as métricas em um único loop sobre os registros do banco, evitando múltiplas passagens pelo array.

### Funções auxiliares

**`parseRow(row)`**
Converte uma linha do banco SQLite para um objeto JavaScript. Os campos `saude`, `educacao` e `assistencia_social` são strings JSON no banco — `JSON.parse` os transforma em objetos. O campo `revisado` é `0` ou `1` no SQLite e vira `boolean`.

**`calcularIdade(dataNascimento)`**
Calcula a idade exata em anos a partir da data de nascimento, considerando se o aniversário deste ano já passou ou não.

**`mapObj(obj)`**
Converte um objeto de contagem como `{ vacinas_atrasadas: 8 }` para um array `[{ alerta: "vacinas_atrasadas", total: 8 }]` — formato mais fácil de consumir no frontend.

**`separarAlertasPorArea(parsed)`**
Percorre todas as crianças e conta quantas vezes cada alerta aparece em cada área, usando `mapObj` para formatar o resultado final.

**`gerarInsights(rows, parsed, contagemAlertas)`**
Gera insights automáticos em um único loop com as seguintes regras:

- **Múltiplos alertas** — crianças com alertas em 2 ou mais áreas simultaneamente
- **Faixa etária crítica** — qual faixa (0-5, 6-12, 13-17) tem maior percentual de alertas
- **Sem dados** — crianças sem nenhuma área cadastrada
- **Alerta mais frequente** — usa a `contagemAlertas` já calculada no loop principal
- **Taxa de revisão** — percentual de casos ainda não revisados

Os insights são ordenados por prioridade: `critico` → `atencao` → `info`.

**`getSummary(req, res)`**
Controller principal que executa um único loop sobre todos os registros calculando simultaneamente:

- Contadores gerais (`revisados`, `com_alertas`)
- Alertas por área (`saude`, `educacao`, `assistencia_social`)
- Agrupamento por bairro com contagem de alertas
- Contagem global de alertas para os insights

### Por que um único loop?

A abordagem de loop único evita múltiplas passagens pelo array que ocorreriam ao usar `.filter()`, `.map()` ou `.reduce()` separados para cada métrica. Com 25 registros a diferença é imperceptível, mas a decisão documenta uma preocupação com performance e escalabilidade — se o volume de dados crescer, o custo computacional cresce linearmente e não multiplicado pelo número de métricas.

## Mapa de Calor por Bairro

O dashboard conta com um mapa de calor interativo dos bairros do Rio de Janeiro, construído com **Leaflet** e dados geoespaciais oficiais da Prefeitura do Rio.

### Fonte dos dados geográficos

Os polígonos dos bairros são carregados dinamicamente da API oficial do IPP (Instituto Pereira Passos):
https://pgeo3.rio.rj.gov.br/arcgis/rest/services/Cartografia/Limites_administrativos/MapServer/4/query

Os dados são retornados no formato ESRI JSON e convertidos para GeoJSON padrão usando a biblioteca `@esri/arcgis-to-geojson-utils`.

### Funcionalidades

- **Mapa de calor** — cores por intensidade de alertas por bairro (amarelo → laranja → vermelho)
- **Clique no bairro** — redireciona para a lista de crianças filtrada pelo bairro selecionado
- **Tooltip rico** — exibe total de crianças, percentual de alertas e os 3 principais tipos de alerta do bairro
- **Highlight** — bairro selecionado recebe borda azul e os demais ficam transparentes
- **Bairros críticos** — borda vermelha automática em bairros com mais de 70% de alertas
- **Bairros sem dados** — exibidos com preenchimento transparente e borda cinza

### Decisões técnicas

- **`dynamic` com `ssr: false`** — o Leaflet usa `window` e `document` diretamente, portanto não pode rodar no servidor. O componente é carregado dinamicamente apenas no browser
- **Cache global do GeoJSON** — o fetch da API é iniciado assim que o arquivo é importado e o resultado é cacheado em memória, evitando múltiplas requisições
- **`geoLayerRef`** — o layer do Leaflet é mantido em uma ref e apenas os estilos são atualizados quando o bairro selecionado muda, sem recriar o mapa
- **Normalização de nomes** — os nomes dos bairros são normalizados removendo acentos e convertendo para minúsculas antes da comparação, evitando inconsistências entre os dados do backend e do GeoJSON

## Página de Crianças

### Componentes

**`ChildrenFilters.tsx`**
Painel de filtros com 7 opções: busca por nome (com debounce de 350ms), bairro, faixa etária, alertas, área de alerta, tipo de alerta e revisão. Inclui ordenação alfabética integrada ao nome, contador de filtros ativos e tags clicáveis para remover filtros individualmente.

**`ChildrenList.tsx`**
Visualização em tabela com colunas de nome, bairro, status por área (saúde, educação, assistência) e status de revisão. Exibe a idade calculada da criança. Colunas de área são ocultadas em mobile.

**`ChildrenCards.tsx`**
Visualização em grid de cards com borda colorida por severidade (laranja para alertas, verde para ok, cinza para sem dados). Cada card exibe nome, idade, bairro, status por área com ícone e badge de revisão. Inclui ordenação por nome.

**`ViewToggle.tsx`**
Toggle entre visualização lista e cards. O modo escolhido é persistido no `localStorage` — ao voltar de uma página de detalhe, o usuário retorna ao mesmo modo de visualização.

**`Pagination.tsx`**
Paginação com reticências para muitas páginas, `aria-label` e `aria-current` para acessibilidade. Lista usa 10 itens por página, cards usam 9 (grid 3x3).

### Decisões

- **Debounce no nome** — evita requisição a cada tecla digitada, aguarda 350ms de inatividade
- **Ordenação no backend** — a ordenação alfabética é feita no servidor para garantir consistência entre páginas
- **Persistência do modo de visualização** — `localStorage` mantém a preferência do usuário entre navegações
- **Limites diferentes por modo** — lista usa 10 itens (tabela) e cards usam 9 (grid 3x3 completo)
