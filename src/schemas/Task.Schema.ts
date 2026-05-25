import { z } from 'zod';

export const CreateTaskSchema = z.object({
  title:       z.string().min(1, 'O título é obrigatório'),
  description: z.string().min(1, 'A descrição é obrigatória'),
});

export const UpdateTaskSchema = z.object({
  title:       z.string().min(1, 'O título é obrigatório').optional(),
  description: z.string().min(1, 'A descrição é obrigatória').optional(),
  status:      z.enum(['pendente', 'em andamento', 'concluída']).optional(),
});
