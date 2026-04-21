# Desafio Técnico - Full Stack Pleno da Prefeitura do Rio

Adicionando estrurura inicial de pastas para construção de um painel de acompanhamento de crianças em vulnerabilidade.

## Dependencias do backend
- **Express** — framework HTTP para criação das rotas e servidor
- **better-sqlite3** — banco de dados SQLite simples e sem servidor separado
- **jsonwebtoken** — geração e verificação de tokens JWT para autenticação
- **dotenv** — gerenciamento de variáveis de ambiente
- **cors** — liberação de requisições entre frontend (3000) e backend (3001)
- **nodemon** — reinício automático do servidor em desenvolvimento

### Como rodar

```bash
cd backend
npm install
npm run dev
```