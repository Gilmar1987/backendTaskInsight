import { z } from 'zod';
import 'dotenv/config';

export const envSchema = z.object({
  PORT: z.string().default('3000'),
  MONGODB_URI: z.string().url(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('60m'),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  FRONTEND_URL: z.string().url().default('http://localhost:3001'),
  RESEND_API_KEY: z.string(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('Erro ao validar as variáveis de ambiente:', parsedEnv.error.format());
  process.exit(1);
}
export const env = parsedEnv.data;