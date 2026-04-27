# Painel de Monitoramento - Backend

Backend do sistema de monitoramento de crianças em situação de vulnerabilidade social da Prefeitura do Rio de Janeiro. Desenvolvida em Node.js com Express e SQLite.

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Runtime | Node.js 18+ |
| Framework | Express 5 |
| Banco de dados | SQLite (better-sqlite3) |
| Autenticação | JWT (jsonwebtoken) |
| Testes | Jest + Supertest |
| Dev server | Nodemon |

## Pré-requisitos

- Node.js 18+
- npm 9+

## Instalação e execução

```bash
npm install
cp .env.example .env
npm run dev

# Produção
npm start
```

O servidor sobe em `http://localhost:3001`.

## Variáveis de ambiente

Crie um arquivo `.env` na raiz da pasta `backend`:

```env
JWT_SECRET=sua_chave_aqui
PORT=3001
```

> `JWT_SECRET` é obrigatório - o servidor lança um erro e encerra se não estiver definido.

## Scripts disponíveis

```bash
npm run dev    # Servidor com hot reload (nodemon)
npm start      # Servidor de produção
npm test       # Executa a suíte de testes (Jest)
```

## Estrutura de pastas

```
backend/
├── data/
│   ├── seed.json          # 25 crianças de exemplo para o banco
│   └── banco.db           # Arquivo SQLite (gerado na primeira execução)
├── src/
│   ├── server.js          # Entry point - inicializa o servidor
│   ├── app.js             # Configuração do Express (middlewares, rotas)
│   ├── utils.js           # Funções auxiliares (calcularIdade)
│   ├── controllers/
│   │   ├── authController.js      # Login e geração de token
│   │   ├── childrenController.js  # Listagem, detalhe e revisão
│   │   └── summaryController.js   # Resumo agregado e insights
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── childrenRoutes.js
│   │   └── summaryRoutes.js
│   ├── middleware/
│   │   └── auth.js        # Validação do Bearer token em rotas protegidas
│   └── database/
│       ├── index.js       # Conexão SQLite com WAL mode
│       └── seeders/
│           └── seed.js    # Criação da tabela e carga do seed.json
└── tests/
    ├── setup.js            # Configuração global do Jest
    ├── auth.test.js
    ├── children.test.js
    ├── summary.test.js
    └── utils.test.js
```

## Banco de dados

O banco é criado automaticamente em `data/banco.db` na primeira execução. O seed carrega 25 crianças do arquivo `data/seed.json` usando `INSERT OR IGNORE`, ou seja, re-executar o servidor não duplica os dados.

**Schema da tabela `children`:**

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | TEXT (PK) | Identificador único (ex: `c001`) |
| `nome` | TEXT | Nome completo |
| `data_nascimento` | TEXT | Formato ISO 8601 |
| `bairro` | TEXT | Bairro de residência |
| `responsavel` | TEXT | Nome do responsável |
| `saude` | TEXT (JSON) | Dados de saúde (consultas, vacinas, alertas) |
| `educacao` | TEXT (JSON) | Dados de educação (frequência, matrícula, alertas) |
| `assistencia_social` | TEXT (JSON) | Dados de assistência (benefícios, alertas) |
| `revisado` | INTEGER | `0` = pendente, `1` = revisado |
| `revisado_por` | TEXT | E-mail do técnico que revisou |
| `revisado_em` | TEXT | Timestamp ISO da revisão |

As três áreas (`saude`, `educacao`, `assistencia_social`) são armazenadas como JSON. Um valor `null` indica que não há dados cadastrados para aquela área no sistema de origem.

## Endpoints da API

### Autenticação

#### `POST /auth/token`

Autentica o usuário e retorna um JWT com validade de 8 horas.

**Body:**
```json
{
  "email": "tecnico@prefeitura.rio",
  "senha": "painel@2024"
}
```

**Resposta 200:**
```json
{
  "token": "<jwt>"
}
```

**Resposta 401:**
```json
{ "error": "Credenciais inválidas" }
```

---

### Crianças

#### `GET /children`

Retorna lista paginada de crianças com filtros opcionais.

**Query params:**

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `nome` | string | Busca parcial por nome (acentos ignorados) |
| `bairro` | string | Filtro exato por bairro |
| `alertas` | boolean | `true` = apenas com alertas, `false` = sem alertas |
| `revisado` | boolean | `true` = revisados, `false` = pendentes |
| `area` | string | `saude`, `educacao` ou `assistencia` - filtra por área com alertas |
| `faixaEtaria` | string | `0-5`, `6-12` ou `13-17` |
| `tipoAlerta` | string | Valor exato de um alerta (ex: `vacinas_atrasadas`) |
| `orderBy` | string | `nome` para ordenação alfabética |
| `orderDir` | string | `asc` (padrão) ou `desc` |
| `page` | number | Página (padrão: `1`) |
| `limit` | number | Itens por página (padrão: `25`) |

**Resposta 200:**
```json
{
  "data": [ /* array de crianças */ ],
  "meta": {
    "total": 25,
    "page": 1,
    "limit": 25,
    "totalPages": 1
  }
}
```

---

#### `GET /children/:id`

Retorna os dados completos de uma criança.

**Resposta 200:** objeto completo da criança com as três áreas deserializadas.

**Resposta 404:**
```json
{ "error": "Criança não encontrada" }
```

---

#### `PATCH /children/:id/review` 🔒

Marca um caso como revisado. Requer autenticação.

**Header obrigatório:**
```
Authorization: Bearer <jwt>
```

O campo `revisado_por` é preenchido com o `preferred_username` extraído do token (e-mail do técnico).

**Resposta 200 (idempotente - retorna o estado atual se já revisado):**
```json
{
  "message": "Caso revisado com sucesso",
  "data": { /* criança atualizada */ }
}
```

---

### Resumo

#### `GET /summary`

Retorna estatísticas agregadas do painel em um único loop sobre todos os registros.

**Resposta 200:**
```json
{
  "totalCriancas": 25,
  "comAlertas": 18,
  "revisados": 3,
  "pendentes": 22,
  "alertasPorArea": {
    "saude": [{ "alerta": "vacinas_atrasadas", "total": 5 }],
    "educacao": [{ "alerta": "baixa_frequencia", "total": 8 }],
    "assistencia_social": [{ "alerta": "beneficio_cancelado", "total": 3 }]
  },
  "bairros": [
    { "bairro": "Rocinha", "total": 4, "comAlertas": 3 }
  ],
  "insights": [ /* array de strings com observações automáticas */ ]
}
```

## Autenticação nas rotas

O middleware `auth.js` valida o header `Authorization: Bearer <token>` e rejeita com `401` em caso de token ausente, malformado, inválido ou expirado. Apenas a rota `PATCH /children/:id/review` exige autenticação.

## Testes

Os testes usam um banco SQLite **em memória** - o banco de dados real (`banco.db`) não é afetado.

```bash
npm test
```

| Arquivo | Cobertura |
|---|---|
| `auth.test.js` | Login com credenciais corretas e incorretas, geração e formato do token |
| `children.test.js` | Listagem, filtros (bairro, alertas, revisado, área), paginação, detalhe, revisão |
| `summary.test.js` | Totais, alertas por área, dados de bairros, geração de insights |
| `utils.test.js` | Cálculo de idade a partir da data de nascimento |