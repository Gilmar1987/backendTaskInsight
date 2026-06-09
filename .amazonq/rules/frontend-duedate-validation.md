# Guia de Implementação: Validação de Data de Vencimento (Frontend)

Este documento descreve como implementar a validação do campo `dueDate` no frontend Next.js para garantir paridade total com as regras de negócio do backend.

---

## 1. Schema de Validação (Zod)

Para que o erro `invalid_type` ou `regex` não ocorra apenas no servidor, o schema do frontend deve refletir exatamente as restrições do arquivo `backendTaskInsight/src/schemas/Task.Schema.ts`.

```typescript
import { z } from 'zod';

// Regex idêntico ao backend para formato YYYY-MM-DD
const dateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

export const taskFormSchema = z.object({
  title: z.string().min(3, 'O título deve ter no mínimo 3 caracteres'),
  description: z.string().min(1, 'A descrição é obrigatória'),
  
  // Implementação da dueDate com paridade ao backend
  dueDate: z.string({ required_error: 'A data de vencimento é obrigatória' })
    .trim()
    .min(1, 'A data de vencimento é obrigatória')
    .regex(dateRegex, 'Data deve estar no formato YYYY-MM-DD')
    .refine((val) => {
      const date = new Date(val);
      return !isNaN(date.getTime());
    }, { message: 'Data inválida' })
    .refine((val) => {
      const date = new Date(val);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Compara apenas a data, ignorando o horário
      return date > today;
    }, { message: 'A data de vencimento deve ser no futuro' }),
});
```

---

## 2. Integração com React Hook Form

Ao utilizar o `input type="date"`, o navegador geralmente retorna a string no formato `YYYY-MM-DD`, o que é compatível com o nosso `dateRegex`.

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export function TaskForm() {
  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm({
    resolver: zodResolver(taskFormSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col gap-1">
        <label htmlFor="dueDate">Data de Vencimento</label>
        <input
          id="dueDate"
          type="date"
          {...register('dueDate')}
          className={errors.dueDate ? 'border-red-500' : ''}
        />
        {/* Exibição da mensagem de erro vinda do Zod */}
        {errors.dueDate && (
          <span className="text-red-500 text-sm">{errors.dueDate.message}</span>
        )}
      </div>
      
      <button type="submit">Salvar Tarefa</button>
    </form>
  );
}
```

---

## 3. Observações Técnicas

- **UTC vs Local:** O backend converte a string para `Date`. Certifique-se de que o input do navegador não está aplicando offsets de fuso horário indesejados ao capturar apenas a string `YYYY-MM-DD`.
- **Data Mínima:** É recomendável adicionar o atributo `min={new Date().toISOString().split('T')[0]}` no elemento `<input />` para impedir visualmente a seleção de datas passadas, servindo como uma primeira camada de validação visual.
- **Mensagens de Erro:** As mensagens definidas acima são as mesmas retornadas pela API, garantindo que o usuário veja o mesmo texto independentemente de onde a validação falhe.