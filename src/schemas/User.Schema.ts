import { z } from 'zod';

export const UserSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório'),
  email: z.string().check(z.email({ message: "Endereço de e-mail inválido" })),
  password: z.string().min(6, 'A senha deve conter no mínimo 6 caracteres'),
  role: z.enum(['user', 'admin']).default('user')
});

export const LoginSchema = z.object({
  email: z.string().check(z.email({ message: "Endereço de e-mail inválido" })),
  password: z.string().min(6, 'A senha deve conter no mínimo 6 caracteres'),
});

export const UpdateUserSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório').optional(),
  email: z.string().check(z.email({ message: "Endereço de e-mail inválido" })).optional(),
  password: z.string().min(6, 'A senha deve conter no mínimo 6 caracteres').optional(),
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token é obrigatório'),
});

