# TaskInsight — Guia de Implementação Frontend (Next.js)

Guia completo para implementar o frontend do TaskInsight com Next.js, consumindo a API RESTful.

---

## Tecnologias Recomendadas

- **Next.js 14+** com App Router
- **TypeScript**
- **Axios** ou **fetch nativo** — requisições HTTP
- **Zod** — validação de formulários
- **React Hook Form** — gerenciamento de formulários
- **Zustand** ou **Context API** — gerenciamento de estado global (auth)
- **TailwindCSS** — estilização
- **date-fns** — formatação de datas

---

## Instalação

```bash
npx create-next-app@latest frontend-taskinsight --typescript --tailwind --app
cd frontend-taskinsight
npm install axios zod react-hook-form @hookform/resolvers zustand date-fns
```

---

## Variáveis de Ambiente

Crie o arquivo `.env.local` na raiz do projeto Next.js:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

---

## Estrutura de Pastas Recomendada

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── dashboard/
│   │   ├── page.tsx
│   │   └── tasks/
│   │       ├── page.tsx
│   │       └── [id]/
│   │           └── page.tsx
│   └── layout.tsx
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   └── tasks/
│       ├── TaskCard.tsx
│       ├── TaskForm.tsx
│       └── TaskList.tsx
├── services/
│   ├── api.ts
│   ├── auth.service.ts
│   └── task.service.ts
├── store/
│   └── auth.store.ts
└── types/
    ├── user.types.ts
    └── task.types.ts
```

---

## Tipos TypeScript

### `src/types/user.types.ts`
```typescript
export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface ILoginResponse {
  success: boolean;
  data: {
    user: IUser;
    token: string;
    refreshToken: string;
  };
}
```

### `src/types/task.types.ts`
```typescript
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface ITask {
  _id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  userId: string;
  dueDate: string | null;
  startedAt: string | null;
  completedAt: string | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateTask {
  title: string;
  description: string;
  priority?: TaskPriority;
  dueDate?: string;
}

export interface IUpdateTask {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
}
```

---

## Cliente HTTP

### `src/services/api.ts`
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Injeta o token em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Redireciona para login se token expirar
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## Gerenciamento de Estado (Auth)

### `src/store/auth.store.ts`
```typescript
import { create } from 'zustand';
import { IUser } from '../types/user.types';

interface AuthStore {
  user: IUser | null;
  token: string | null;
  setAuth: (user: IUser, token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  setAuth: (user, token) => {
    localStorage.setItem('token', token);
    set({ user, token });
  },
  clearAuth: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },
}));
```

---

## Services

### `src/services/auth.service.ts`
```typescript
import api from './api';
import { ILoginResponse } from '../types/user.types';

export const authService = {
  register: async (name: string, email: string, password: string) => {
    const { data } = await api.post('/users/register', { name, email, password });
    return data;
  },

  login: async (email: string, password: string): Promise<ILoginResponse> => {
    const { data } = await api.post('/users/login', { email, password });
    return data;
  },

  logout: async (userId: string) => {
    await api.post(`/users/${userId}/logout`);
  },
};
```

### `src/services/task.service.ts`
```typescript
import api from './api';
import { ICreateTask, IUpdateTask, ITask } from '../types/task.types';

export const taskService = {
  create: async (task: ICreateTask): Promise<ITask> => {
    const { data } = await api.post('/tasks', task);
    return data.data;
  },

  getAll: async (): Promise<ITask[]> => {
    const { data } = await api.get('/tasks');
    return data.data;
  },

  getById: async (id: string): Promise<ITask> => {
    const { data } = await api.get(`/tasks/${id}`);
    return data.data;
  },

  update: async (id: string, task: IUpdateTask): Promise<ITask> => {
    const { data } = await api.put(`/tasks/${id}`, task);
    return data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },
};
```

---

## Autenticação

### `src/app/(auth)/login/page.tsx`
```typescript
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (form: LoginForm) => {
    const response = await authService.login(form.email, form.password);
    setAuth(response.data.user, response.data.token);
    router.push('/dashboard');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input type="email" placeholder="Email" {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}

      <input type="password" placeholder="Senha" {...register('password')} />
      {errors.password && <span>{errors.password.message}</span>}

      <button type="submit">Entrar</button>
    </form>
  );
}
```

---

## Tarefas

### `src/components/tasks/TaskForm.tsx`
```typescript
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { taskService } from '@/services/task.service';

const taskSchema = z.object({
  title:       z.string().min(3, 'Mínimo 3 caracteres').max(120),
  description: z.string().min(1, 'Obrigatório').max(1000),
  priority:    z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
  dueDate:     z.string().optional(),
});

type TaskForm = z.infer<typeof taskSchema>;

export default function TaskForm({ onSuccess }: { onSuccess: () => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<TaskForm>({
    resolver: zodResolver(taskSchema),
  });

  const onSubmit = async (form: TaskForm) => {
    await taskService.create({
      ...form,
      dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : undefined,
    });
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input placeholder="Título" {...register('title')} />
      {errors.title && <span>{errors.title.message}</span>}

      <textarea placeholder="Descrição" {...register('description')} />
      {errors.description && <span>{errors.description.message}</span>}

      <select {...register('priority')}>
        <option value="LOW">Baixa</option>
        <option value="MEDIUM">Média</option>
        <option value="HIGH">Alta</option>
      </select>

      {/* Date picker amigável — o Next.js converte para ISO automaticamente */}
      <input type="date" {...register('dueDate')} />

      <button type="submit">Criar Tarefa</button>
    </form>
  );
}
```

### `src/components/tasks/TaskCard.tsx`
```typescript
'use client';
import { ITask, TaskStatus } from '@/types/task.types';
import { taskService } from '@/services/task.service';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const statusLabels: Record<TaskStatus, string> = {
  PENDING:     'Pendente',
  IN_PROGRESS: 'Em Andamento',
  DONE:        'Concluída',
  CANCELLED:   'Cancelada',
};

const nextStatus: Partial<Record<TaskStatus, TaskStatus>> = {
  PENDING:     'IN_PROGRESS',
  IN_PROGRESS: 'DONE',
};

interface Props {
  task: ITask;
  onUpdate: () => void;
}

export default function TaskCard({ task, onUpdate }: Props) {
  const handleStatusChange = async (status: TaskStatus) => {
    await taskService.update(task._id, { status });
    onUpdate();
  };

  const handleDelete = async () => {
    await taskService.delete(task._id);
    onUpdate();
  };

  const completionTime = task.startedAt && task.completedAt
    ? Math.round((new Date(task.completedAt).getTime() - new Date(task.startedAt).getTime()) / 60000)
    : null;

  return (
    <div>
      <h3>{task.title}</h3>
      <p>{task.description}</p>
      <span>Status: {statusLabels[task.status]}</span>
      <span>Prioridade: {task.priority}</span>

      {task.dueDate && (
        <span>Prazo: {format(new Date(task.dueDate), 'dd/MM/yyyy', { locale: ptBR })}</span>
      )}

      {completionTime && (
        <span>Tempo de conclusão: {completionTime} minutos</span>
      )}

      {nextStatus[task.status] && (
        <button onClick={() => handleStatusChange(nextStatus[task.status]!)}>
          Avançar para {statusLabels[nextStatus[task.status]!]}
        </button>
      )}

      {(task.status === 'PENDING' || task.status === 'IN_PROGRESS') && (
        <button onClick={() => handleStatusChange('CANCELLED')}>Cancelar</button>
      )}

      {task.status !== 'DONE' && task.status !== 'CANCELLED' && (
        <button onClick={handleDelete}>Excluir</button>
      )}
    </div>
  );
}
```

---

## Proteção de Rotas

### `src/middleware.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') ||
                     request.nextUrl.pathname.startsWith('/register');

  if (!token && !isAuthPage)
    return NextResponse.redirect(new URL('/login', request.url));

  if (token && isAuthPage)
    return NextResponse.redirect(new URL('/dashboard', request.url));

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
};
```

---

## Fluxo Completo de Status no Frontend

O `TaskCard` já implementa o fluxo da máquina de estados:

```
PENDING → [botão "Iniciar"]     → IN_PROGRESS
          [botão "Cancelar"]    → CANCELLED

IN_PROGRESS → [botão "Concluir"]  → DONE
              [botão "Cancelar"]  → CANCELLED

DONE      → nenhum botão de mudança
CANCELLED → nenhum botão de mudança
```

A API retorna `400 Bad Request` se uma transição inválida for tentada diretamente.

---

## Métricas Disponíveis

Com os dados retornados pela API é possível calcular no frontend:

```typescript
// Tempo médio de conclusão (em minutos)
const avgTime = tasks
  .filter(t => t.startedAt && t.completedAt)
  .map(t => new Date(t.completedAt!).getTime() - new Date(t.startedAt!).getTime())
  .reduce((acc, t, _, arr) => acc + t / arr.length, 0) / 60000;

// Tarefas atrasadas
const overdue = tasks.filter(t =>
  t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'DONE'
);

// Distribuição por status
const byStatus = tasks.reduce((acc, t) => {
  acc[t.status] = (acc[t.status] || 0) + 1;
  return acc;
}, {} as Record<TaskStatus, number>);

// Distribuição por prioridade
const byPriority = tasks.reduce((acc, t) => {
  acc[t.priority] = (acc[t.priority] || 0) + 1;
  return acc;
}, {} as Record<TaskPriority, number>);
```
