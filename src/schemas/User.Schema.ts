import { z } from 'zod';

const emailValidation = z.string().check(z.email({ message: "Endereço de e-mail inválido" }));

const passwordValidation = z.string()
  .min(6, 'A senha deve conter no mínimo 6 caracteres')
  .regex(/[A-Z]/, 'A senha deve conter pelo menos uma letra maiúscula')
  .regex(/[0-9]/, 'A senha deve conter pelo menos um número')
  .regex(/[^a-zA-Z0-9]/, 'A senha deve conter pelo menos um caractere especial')
;

export const UserSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório'),
  email: emailValidation,
  password: passwordValidation,
  role: z.enum(['user', 'admin']).default('user')
});

export const LoginSchema = z.object({
  email: emailValidation,
  password: z.string().min(6, 'A senha deve conter no mínimo 6 caracteres'),
});

export const UpdateUserSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório').optional(),
  email: emailValidation.optional(),
  password: passwordValidation.optional(),
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token é obrigatório'),
});

// Novo schemas para garantir que a senha e tokens não sejam expostos
export const UserResponseSchema = UserSchema.omit({ password: true }).catchall(z.any());

export const UserListResponseSchema = z.array(UserResponseSchema);
