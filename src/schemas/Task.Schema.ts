import { z } from 'zod';

const dateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const dueDateSchema = z.string({ message: 'A data de vencimento é obrigatória' })
  .trim()
  .min(1, 'A data de vencimento é obrigatória')
  .regex(dateRegex, 'Data deve estar no formato YYYY-MM-DD')
  .transform((val) => new Date(val))
  .refine((date) => date instanceof Date && !isNaN(date.getTime()), { message: 'Data inválida' })
  .refine((date) => date > new Date(), { message: 'A data de vencimento deve ser no futuro' });


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
});
