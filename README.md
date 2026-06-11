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
- **Nodemailer** — envio de emails (recuperação de senha)
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
FRONTEND_URL=http://localhost:3001
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<seu_email>
SMTP_PASS=<sua_senha_de_app>
BREVO_API_KEY=xkeysib-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
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
| POST | `/login` | Login e geração de tokens | ❌ |
| POST | `/refresh` | Renovar access token via refresh token | ❌ |
| POST | `/forgot-password` | Solicitar recuperação de senha | ❌ |
| POST | `/reset-password` | Redefinir senha com token | ❌ |
| GET | `/` | Listar todos os usuários | ✅ Admin |
| GET | `/:id` | Buscar usuário por ID | ✅ |
| PUT | `/:id` | Atualizar usuário | ✅ |
| DELETE | `/:id` | Soft delete | ✅ |
| POST | `/:id/logout` | Logout e invalidação do refresh token | ✅ |

### Tasks `/api/tasks`

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| POST | `/` | Criar tarefa | ✅ |
| GET | `/` | Listar tarefas do usuário | ✅ |
| GET | `/:id` | Buscar tarefa por ID | ✅ |
| PUT | `/:id` | Atualizar tarefa | ✅ |
| DELETE | `/:id` | Soft delete | ✅ |

---

## Fluxo de Autenticação JWT

```
POST /login  ──→  { token, refreshToken }
                        │
              token expira (60m)
                        │
POST /refresh ──→  { token, refreshToken }  (rotação automática)
                        │
POST /:id/logout ──→  refreshToken invalidado no banco
```

- O `token` (access token) tem validade curta (default `60m`)
- O `refreshToken` tem validade longa (default `7d`) e é armazenado no banco
- A cada `/refresh`, um novo par de tokens é emitido (rotação)
- No logout, o `refreshToken` é invalidado, impedindo renovações futuras

---

## Recuperação de Senha

```
POST /forgot-password  ──→  envia email com link (válido 1h)
POST /reset-password   ──→  redefine senha com token do email
```

---

## Modelo de Tarefa

### Campos

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `title` | string | Título da tarefa (3-120 caracteres) |
| `description` | string | Descrição da tarefa (máx. 1000 caracteres) |
| `status` | enum | Status atual da tarefa |
| `priority` | enum | Prioridade da tarefa |
| `userId` | ObjectId | Referência ao usuário dono da tarefa |
| `dueDate` | Date | Data limite para conclusão |
| `startedAt` | Date | Preenchido automaticamente ao iniciar |
| `completedAt` | Date | Preenchido automaticamente ao concluir |
| `isDeleted` | boolean | Soft delete |
| `deletedAt` | Date | Data do soft delete |

### Status

| Valor | Descrição |
|-------|-----------|
| `PENDING` | Tarefa criada, aguardando início |
| `IN_PROGRESS` | Tarefa em andamento |
| `DONE` | Tarefa concluída |
| `CANCELLED` | Tarefa cancelada |

### Prioridade

| Valor | Descrição |
|-------|-----------|
| `LOW` | Baixa prioridade |
| `MEDIUM` | Média prioridade (default) |
| `HIGH` | Alta prioridade |

### Máquina de Estados

As transições de status seguem regras estritas implementadas no Service:

```
PENDING ──→ IN_PROGRESS ──→ DONE
   │              │
   └──────────────┴──→ CANCELLED
```

| De | Para | Permitido |
|----|------|-----------|
| `PENDING` | `IN_PROGRESS` | ✅ |
| `PENDING` | `CANCELLED` | ✅ |
| `IN_PROGRESS` | `DONE` | ✅ |
| `IN_PROGRESS` | `CANCELLED` | ✅ |
| `DONE` | qualquer | ❌ |
| `CANCELLED` | qualquer | ❌ |

Transições inválidas retornam `400 Bad Request`.

### Datas Automáticas

As datas são preenchidas automaticamente pela lógica de negócio no Service:
- `startedAt` — preenchido ao mudar para `IN_PROGRESS`
- `completedAt` — preenchido ao mudar para `DONE`

Isso permite calcular o **tempo médio de conclusão** de tarefas (`completedAt - startedAt`).

---

## Governança com Amazon Q

O arquivo `.amazonq/rules/apiNode-agent.md` é um protocolo operacional que instrui o agente Amazon Q Developer a:

- Respeitar os limites de cada camada arquitetural
- Proibir acesso direto ao banco fora do Repository
- Proibir lógica de negócio no Controller ou Repository
- Proibir o uso do tipo `any`
- Rastrear toda geração de código com etiquetas de skill (ex: `// [Skill: service]`)


### Contribuiçãosões são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests para