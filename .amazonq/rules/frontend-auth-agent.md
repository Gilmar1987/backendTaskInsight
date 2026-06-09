# Prompt para Agente de IA — Implementação de Autenticação JWT no Frontend

## Contexto

A API TaskInsight (`http://localhost:3000/api`) possui um fluxo completo de autenticação JWT com rotação de refresh token e recuperação de senha. Implemente no frontend todos os mecanismos necessários para consumir esses fluxos corretamente.

---

## 1. Fluxo de Autenticação JWT

### Contratos da API

**POST `/api/users/login`**
```json
// Request
{ "email": "string", "password": "string" }

// Response 200
{
  "success": true,
  "data": {
    "user": { "id": "string", "name": "string", "email": "string", "role": "user|admin" },
    "token": "<access_token_jwt>",
    "refreshToken": "<refresh_token_jwt>"
  }
}
```

**POST `/api/users/refresh`**
```json
// Request
{ "refreshToken": "string" }

// Response 200
{
  "success": true,
  "data": {
    "token": "<novo_access_token>",
    "refreshToken": "<novo_refresh_token>"
  }
}
```

**POST `/api/users/:id/logout`**
```
// Header: Authorization: Bearer <access_token>
// Response 204 No Content
```

### Regras de Implementação

1. Após o login, armazene `token` e `refreshToken` — preferencialmente em `localStorage` ou `sessionStorage`. Se usar cookies, adicione proteção CSRF.
2. Envie o `token` em todas as requisições autenticadas no header: `Authorization: Bearer <token>`.
3. O `token` expira em **60 minutos**. Implemente um interceptor HTTP que:
   - Detecte resposta `401` em qualquer requisição autenticada
   - Chame automaticamente `POST /api/users/refresh` com o `refreshToken` armazenado
   - Substitua o par `token` + `refreshToken` armazenados pelos novos valores retornados
   - Reenvie a requisição original com o novo `token`
   - Se o refresh também retornar erro (token expirado/inválido), redirecione o usuário para a tela de login
4. O `refreshToken` tem validade de **7 dias**. A cada `/refresh` bem-sucedido, um novo par é emitido (rotação). Sempre substitua ambos os tokens armazenados.
5. No logout, chame `POST /api/users/:id/logout` passando o `id` do usuário autenticado e limpe os tokens armazenados.

### Fluxo Resumido

```
Login ──→ Armazena { token, refreshToken }
             │
    Requisição com token expirado (401)
             │
    Chama POST /refresh com refreshToken
             │
    ┌────────┴────────┐
  sucesso           erro (refresh expirado)
    │                    │
  Atualiza tokens    Limpa tokens
  Reenvia requisição Redireciona para /login
```

---

## 2. Recuperação de Senha

### Contratos da API

**POST `/api/users/forgot-password`**
```json
// Request
{ "email": "string" }

// Response 200 (sempre, independente de o email existir)
{
  "success": true,
  "message": "Se o email existir, você receberá as instruções em breve."
}
```

**POST `/api/users/reset-password`**
```json
// Request
{ "token": "string", "password": "string" }

// Response 200
{ "success": true, "message": "Senha redefinida com sucesso." }

// Response 400
{ "success": false, "message": "Token inválido ou expirado" }
```

### Regras de Implementação

1. Crie uma página `/forgot-password` com campo de email. Ao submeter, chame `POST /api/users/forgot-password` e exiba a mensagem de retorno da API independente do resultado (não revele se o email existe ou não).
2. O link enviado por email tem o formato: `<FRONTEND_URL>/reset-password?token=<token>`. Crie a página `/reset-password` que:
   - Leia o parâmetro `token` da query string da URL
   - Exiba um formulário de nova senha (campo senha + confirmação)
   - Ao submeter, chame `POST /api/users/reset-password` com `{ token, password }`
   - Em caso de sucesso, redirecione para `/login` com mensagem de confirmação
   - Em caso de erro `400`, exiba mensagem de token inválido ou expirado com link para `/forgot-password`
3. O token de reset expira em **1 hora**.

### Fluxo Resumido

```
/forgot-password ──→ POST /forgot-password ──→ Exibe mensagem genérica
                                                      │
                                          Usuário recebe email com link
                                                      │
/reset-password?token=xxx ──→ POST /reset-password ──┤
                                                      │
                                          ┌───────────┴───────────┐
                                        200                       400
                                          │                         │
                                   Redireciona /login        Exibe erro +
                                   com mensagem ok           link /forgot-password
```

---

## 3. Tratamento de Erros Padrão da API

Todos os erros seguem o formato:
```json
{ "success": false, "error": "mensagem do erro" }
```

Códigos relevantes para autenticação:
| Status | Significado |
|--------|-------------|
| `401` | Token ausente, inválido ou expirado |
| `400` | Dados inválidos (ex: token de reset expirado) |
| `404` | Recurso não encontrado |

---

## 4. Variáveis de Ambiente

Configure no `.env` do frontend:
```env
VITE_API_URL=http://localhost:3000/api
```

Use `VITE_API_URL` como base para todas as chamadas à API.
