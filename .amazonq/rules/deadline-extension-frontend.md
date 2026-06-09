# Script de Implementação — Prorrogação de Prazo de Tarefa (Frontend Next.js)

## Contexto

A API TaskInsight possui um endpoint `PUT /api/tasks/:id` que permite atualizar o prazo de uma tarefa (`dueDate`) e registrar o motivo da prorrogação (`deadlineChangeReason`) no campo `deadlineHistory` do documento MongoDB.

O campo `dueDate` é consumido pela FastAPI de analytics para geração de métricas, portanto deve estar sempre atualizado com o prazo vigente.

---

## Contrato da API

**Endpoint:**
```
PUT http://localhost:3000/api/tasks/:id
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "dueDate": "2026-07-01",
  "deadlineChangeReason": "Cliente solicitou extensão do prazo"
}
```

**Regras de negócio:**
- `dueDate` e `deadlineChangeReason` devem ser enviados juntos para registrar no histórico
- `dueDate` aceita qualquer formato de data válido (`"2026-07-01"` ou `"2026-07-01T00:00:00.000Z"`)
- `deadlineChangeReason` tem máximo de 500 caracteres
- O campo `dueDate` da tarefa é sempre atualizado com o novo prazo
- O `deadlineHistory` acumula todas as prorrogações anteriores

**Response de sucesso (`200`):**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "title": "...",
    "dueDate": "2026-07-01T00:00:00.000Z",
    "deadlineHistory": [
      {
        "oldDate": "2026-06-01T00:00:00.000Z",
        "newDate": "2026-07-01T00:00:00.000Z",
        "reason": "Cliente solicitou extensão do prazo",
        "changedAt": "2026-05-25T17:00:00.000Z"
      }
    ]
  }
}
```

---

## Tipos TypeScript necessários

```typescript
export interface IDeadlineHistoryEntry {
  oldDate: string | null;
  newDate: string;
  reason: string;
  changedAt: string;
}

export interface IExtendDeadlineForm {
  dueDate: string;
  deadlineChangeReason: string;
}
```

---

## Validação Zod do formulário

```typescript
import { z } from 'zod';

export const extendDeadlineSchema = z.object({
  dueDate: z.string().min(1, 'Nova data é obrigatória'),
  deadlineChangeReason: z.string()
    .min(1, 'Motivo é obrigatório')
    .max(500, 'Máximo de 500 caracteres'),
});

export type ExtendDeadlineForm = z.infer<typeof extendDeadlineSchema>;
```

---

## Service

```typescript
// services/task.service.ts
import api from './api';

export const extendTaskDeadline = async (
  taskId: string,
  dueDate: string,
  deadlineChangeReason: string
) => {
  const { data } = await api.put(`/tasks/${taskId}`, {
    dueDate,
    deadlineChangeReason,
  });
  return data.data;
};
```

---

## Componente do Formulário

```tsx
// components/tasks/ExtendDeadlineForm.tsx
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { extendDeadlineSchema, ExtendDeadlineForm } from '@/schemas/task.schema';
import { extendTaskDeadline } from '@/services/task.service';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Props {
  taskId: string;
  currentDueDate: string | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ExtendDeadlineForm({ taskId, currentDueDate, onSuccess, onCancel }: Props) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ExtendDeadlineForm>({
    resolver: zodResolver(extendDeadlineSchema),
  });

  const onSubmit = async (form: ExtendDeadlineForm) => {
    await extendTaskDeadline(taskId, form.dueDate, form.deadlineChangeReason);
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>

      {currentDueDate && (
        <p>
          Prazo atual: <strong>{format(new Date(currentDueDate), 'dd/MM/yyyy', { locale: ptBR })}</strong>
        </p>
      )}

      <label>Novo prazo</label>
      <input
        type="date"
        min={new Date().toISOString().split('T')[0]}
        {...register('dueDate')}
      />
      {errors.dueDate && <span>{errors.dueDate.message}</span>}

      <label>Motivo da prorrogação</label>
      <textarea
        maxLength={500}
        placeholder="Descreva o motivo da prorrogação..."
        {...register('deadlineChangeReason')}
      />
      {errors.deadlineChangeReason && <span>{errors.deadlineChangeReason.message}</span>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Salvando...' : 'Prorrogar prazo'}
      </button>
      <button type="button" onClick={onCancel}>Cancelar</button>

    </form>
  );
}
```

---

## Componente do Histórico de Prorrogações

```tsx
// components/tasks/DeadlineHistory.tsx
'use client';
import { IDeadlineHistoryEntry } from '@/types/task.types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Props {
  history: IDeadlineHistoryEntry[];
}

export default function DeadlineHistory({ history }: Props) {
  if (history.length === 0)
    return <p>Nenhuma prorrogação registrada.</p>;

  return (
    <ul>
      {history.map((entry, index) => (
        <li key={index}>
          <span>
            {entry.oldDate
              ? format(new Date(entry.oldDate), 'dd/MM/yyyy', { locale: ptBR })
              : 'Sem prazo'
            }
            {' → '}
            {format(new Date(entry.newDate), 'dd/MM/yyyy', { locale: ptBR })}
          </span>
          <p>{entry.reason}</p>
          <small>
            Alterado em {format(new Date(entry.changedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
          </small>
        </li>
      ))}
    </ul>
  );
}
```

---

## Como usar no TaskCard

```tsx
// Adicionar no TaskCard existente
import ExtendDeadlineForm from './ExtendDeadlineForm';
import DeadlineHistory from './DeadlineHistory';

// Estado para controlar o formulário
const [showExtendForm, setShowExtendForm] = useState(false);

// Botão para abrir o formulário (apenas tarefas não concluídas/canceladas)
{task.status !== 'DONE' && task.status !== 'CANCELLED' && (
  <button onClick={() => setShowExtendForm(true)}>
    Prorrogar prazo
  </button>
)}

// Formulário de prorrogação
{showExtendForm && (
  <ExtendDeadlineForm
    taskId={task._id}
    currentDueDate={task.dueDate}
    onSuccess={() => { setShowExtendForm(false); onUpdate(); }}
    onCancel={() => setShowExtendForm(false)}
  />
)}

// Histórico de prorrogações
{task.deadlineHistory.length > 0 && (
  <DeadlineHistory history={task.deadlineHistory} />
)}
```

---

## Notas para o Agente

- O `min` no `input type="date"` impede selecionar datas passadas
- O `onUpdate()` deve refazer o fetch da tarefa para exibir o `dueDate` atualizado
- O `deadlineHistory` é acumulativo — nunca sobrescreve entradas anteriores
- A FastAPI de analytics usa `dueDate` para métricas de prazo, portanto o campo é sempre atualizado com o novo prazo vigente
