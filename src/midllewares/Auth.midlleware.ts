import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { env } from '../config/env';

interface IJwtPayload extends JwtPayload {
  userId: string;
  role: 'user' | 'admin';
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader)
    return res.status(401).json({ message: 'Token não fornecido' });

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as IJwtPayload;
    req.user = { id: decoded.userId, role: decoded.role };
    next();
  } catch {
    return res.status(401).json({ message: 'Token inválido' });
  }
};