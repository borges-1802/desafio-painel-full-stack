# Desafio Técnico - Full Stack Pleno da Prefeitura do Rio

Adicionando documentação do backend atual:

## Dependencias do backend
- **Express** - framework HTTP para criação das rotas e servidor
- **better-sqlite3** - banco de dados SQLite simples e sem servidor separado
- **jsonwebtoken** - geração e verificação de tokens JWT para autenticação
- **dotenv** - gerenciamento de variáveis de ambiente
- **cors** - liberação de requisições entre frontend (3000) e backend (3001)
- **nodemon** - reinício automático do servidor em desenvolvimento

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

## Dependências do frontend

- **Next.js 14+** e **Tailwind CSS**
- **shadcn/ui** - biblioteca de componentes acessíveis baseada em Radix UI
- **axios** - cliente HTTP para consumo da API
- **@tanstack/react-query** - gerenciamento de cache e estado de dados assíncronos
- **react-hook-form** - gerenciamento de formulários
- **zod** - validação de esquemas e formulários
- **lucide-react** - ícones
- **recharts** - gráficos e visualizações
- **sonner** - notificações de feedback visual


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

### Como rodar

```bash
cd frontend
npm install
npm run dev
```