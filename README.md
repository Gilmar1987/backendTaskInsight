# TaskInsight API

API RESTful para gestão de tarefas com autenticação JWT, construída com Node.js, TypeScript e MongoDB Atlas.

---

## Tecnologias

- **Node.js** + **TypeScript**
- **Express 5**
- **MongoDB Atlas** via Mongoose
- **JWT** (jsonwebtoken) — autenticação e refresh token
- **Zod** — validação de schemas
- **Bcrypt** — hash de senhas
- **Helmet** + **CORS** + **Compression** — segurança e performance

---

## Arquitetura

O projeto segue o padrão **MVC+S+R** com fluxo unidirecional estrito:

```
Routes ➔ Controller ➔ Service ➔ Repository ➔ MongoDB
```

| Camada | Responsabilidade |
|--------|-----------------|
| **Routes** | Mapeamento de endpoints e injeção de middlewares |
| **Controller** | Validação de entrada HTTP e formatação de resposta |
| **Service** | Lógica de negócio e regras de domínio |
| **Repository** | Queries ao banco de dados e manipulação de ObjectId |
| **Model** | Definição de schemas e interfaces TypeScript |

> Este projeto utiliza o arquivo `.amazonq/rules/apiNode-agent.md` como protocolo de governança arquitetural para o agente de IA Amazon Q. Ele define as regras, restrições e exemplos canônicos de cada camada, garantindo que toda geração de código respeite os limites arquiteturais e evite deriva estrutural ao longo do desenvolvimento.

---

## Estrutura de Pastas

```
src/
├── @types/         # Extensão de tipos do Express (req.user)
├── config/         # Conexão MongoDB, variáveis de ambiente e JWT
├── controllers/    # Thin controllers (sem lógica de negócio)
├── midllewares/    # Auth, Role, ValidarId e Error handler global
├── models/         # Schemas e interfaces Mongoose
├── repositories/   # Queries isoladas ao MongoDB
├── routers/        # Definição de rotas
├── schemas/        # Schemas de validação Zod
├── services/       # Lógica de negócio
├── app.ts          # Configuração do Express
└── server.ts       # Inicialização do servidor
```

---

## Instalação

```bash
npm install
```

Configure o arquivo `.env` baseado no `.env.example`:

```env
PORT=3000
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>
JWT_SECRET=<min_32_caracteres>
JWT_EXPIRES_IN=60m
JWT_REFRESH_SECRET=<min_32_caracteres>
JWT_REFRESH_EXPIRES_IN=7d
```

Inicie em modo desenvolvimento:

```bash
npm run dev
```

---

## Endpoints

### Users `/api/users`

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| POST | `/register` | Criar usuário | ❌ |
| POST | `/login` | Login | ❌ |
| GET | `/:id` | Buscar usuário | ❌ |
| PUT | `/:id` | Atualizar usuário | ❌ |
| DELETE | `/:id` | Soft delete | ❌ |
| POST | `/:id/logout` | Logout | ✅ |

### Tasks `/api/tasks`

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| POST | `/` | Criar tarefa | ✅ |
| GET | `/` | Listar tarefas do usuário | ✅ |
| GET | `/:id` | Buscar tarefa por ID | ✅ |
| PUT | `/:id` | Atualizar tarefa | ✅ |
| DELETE | `/:id` | Soft delete | ✅ |

---

## Modelo de Tarefa

O campo `status` aceita os valores: `pendente`, `em andamento`, `concluída`.

As datas são preenchidas automaticamente pela lógica de negócio no Service:
- `startedAt` — preenchido ao mudar para `"em andamento"`
- `completedAt` — preenchido ao mudar para `"concluída"`

Isso permite calcular o **tempo médio de conclusão** de tarefas (`completedAt - startedAt`).

---

## Governança com Amazon Q

O arquivo `.amazonq/rules/apiNode-agent.md` é um protocolo operacional que instrui o agente Amazon Q Developer a:

- Respeitar os limites de cada camada arquitetural
- Proibir acesso direto ao banco fora do Repository
- Proibir lógica de negócio no Controller ou Repository
- Proibir o uso do tipo `any`
- Rastrear toda geração de código com etiquetas de skill (ex: `// [Skill: service]`)
