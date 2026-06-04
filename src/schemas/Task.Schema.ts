import { z } from 'zod';

export const CreateTaskSchema = z.object({
  title:       z.string().min(3, 'O título deve ter no mínimo 3 caracteres').max(120),
  description: z.string().min(1, 'A descrição é obrigatória').max(1000),
  priority:    z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
  dueDate:     z.string().datetime().optional().transform((value) => value ? new Date(value) : undefined),
});

export const UpdateTaskSchema = z.object({
  title:                z.string().min(3).max(120).optional(),
  description:          z.string().min(1).max(1000).optional(),
  status:               z.enum(['PENDING', 'IN_PROGRESS', 'DONE', 'CANCELLED']).optional(),
  priority:             z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  dueDate:              z.string().datetime().optional().transform((value) => value ? new Date(value) : undefined),
  deadlineChangeReason: z.string().min(1).max(500).optional(),
});
