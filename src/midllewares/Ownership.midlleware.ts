import { Request, Response, NextFunction } from 'express';

// Garante que o usuário só acesse o próprio recurso, exceto administradores.
export const selfOrAdminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user)
    return res.status(401).json({ success: false, error: 'Não autenticado' });

  if (req.user.role !== 'admin' && req.params.id !== req.user.id)
    return res.status(403).json({ success: false, error: 'Acesso negado' });

  next();
};
