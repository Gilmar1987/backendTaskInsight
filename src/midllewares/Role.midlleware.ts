import { Request, Response, NextFunction } from 'express';

export const roleMiddleware = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role))
      return res.status(403).json({ success: false, error: 'Acesso negado' });

    const userRoler = req.user.role;
    if (!roles.includes(userRoler))
      return res.status(403).json({ success: false, error: 'Acesso negado' });
    next();
  };
};