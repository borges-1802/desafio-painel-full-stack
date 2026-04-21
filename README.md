# Desafio Técnico - Full Stack Pleno da Prefeitura do Rio

Adicionando estrurura inicial de pastas para construção de um painel de acompanhamento de crianças em vulnerabilidade.

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

- POST /auth/token - Autentica um técnico e retorna um JWT.

- GET /children - Lista todas as crianças com suporte a filtros e paginação.

- GET /children/:id - Retorna o detalhe completo de uma criança.

- GET /summary - Lista os dados agregados para o painel.

- PATCH /children/:id/review - Marca uma criança como revisada com a autenticação JWT.

### Autenticação JWT

A autenticação é feita via JWT (JSON Web Token). O token é gerado no endpoint `POST /auth/token` e deve ser enviado no header: `Authorization: Bearer <token>` em todas as rotas protegidas. O token contém: `preferred_username`, `iat` (data da geração), `exp` (data de expiração).

Além disso os erros retornam mensagens diferentes para facilitar a integração com o frontend, como token inválido, expirado ou não fornecido.

### Como rodar

```bash
cd backend
npm install
npm run dev
```