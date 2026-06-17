import { z } from 'zod';

const dateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const dueDateSchema = z.string({
  message: 'A data de vencimento é obrigatória'
})
.trim()
.min(1, 'A data de vencimento é obrigatória')
.regex(dateRegex, 'Data deve estar no formato YYYY-MM-DD')

.transform((val) => {
  const [year, month, day] = val.split('-').map(Number);

  const date = new Date(
    year,
    month - 1,
    day,
    23,
    59,
    59,
    999
  );

  return {
    date,
    year,
    month,
    day
  };
})

.refine(
  ({ date, year, month, day }) => {
    return (
      date.getFullYear() === year &&
      date.getMonth() + 1 === month &&
      date.getDate() === day
    );
  },
  {
    message: 'Data inválida'
  }
)

.transform(({ date }) => date)

.refine(
  (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return date >= today;
  },
  {
    message: 'A data de vencimento não pode ser anterior à data atual'
  }
);






export const CreateTaskSchema = z.object({
  title:       z.string().min(3, 'O título deve ter no mínimo 3 caracteres').max(120),
  description: z.string().min(1, 'A descrição é obrigatória').max(1000),
  priority:    z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
  dueDate:     dueDateSchema,
});

export const UpdateTaskSchema = z.object({
  title:                z.string().min(3).max(120).optional(),
  description:          z.string().min(1).max(1000).optional(),
  status:               z.enum(['PENDING', 'IN_PROGRESS', 'DONE', 'CANCELLED']).optional(),
  priority:             z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  dueDate:              dueDateSchema.optional(),
  deadlineChangeReason: z.string().min(1).max(500).optional(),
}).refine((data) => {
  if (data.dueDate && !data.deadlineChangeReason) return false;
  return true;
}, {
  message: 'O motivo da prorrogação é obrigatório ao alterar a data de vencimento',
  path: ['deadlineChangeReason'],
});
