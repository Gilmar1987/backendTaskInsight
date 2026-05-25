import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from './env';

export const generateTokens = (userId: string, role: string) => ({
  token: jwt.sign({ userId, role }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN } as SignOptions),
  refreshToken: jwt.sign({ userId }, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN } as SignOptions),
});
