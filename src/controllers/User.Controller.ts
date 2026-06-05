// [Skill: controller]
import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/User.Service';
import { UserSchema, LoginSchema, UpdateUserSchema, RefreshTokenSchema } from '../schemas/User.Schema';

const service = new UserService();

export class UserController {
  async createUserController(req: Request, res: Response, next: NextFunction) {
    try {
      const data = UserSchema.parse(req.body);
      const user = await service.createUserService(data.name, data.email, data.password, data.role);
      return res.status(201).json({ success: true, data: user });
    } catch (err) { next(err); }
  }

  async loginUserController(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = LoginSchema.parse(req.body);
      const result = await service.loginUserService(email, password);
      return res.status(200).json({ success: true, data: result });
    } catch (err) { next(err); }
  }

  async refreshTokenUserController(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = RefreshTokenSchema.parse(req.body);
      const result = await service.refreshTokenUserService(refreshToken);
      return res.status(200).json({ success: true, data: result });
    } catch (err) { next(err); }
  }

  async findByIdUserController(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await service.findByIdUserService(req.params.id);
      return res.status(200).json({ success: true, data: user });
    } catch (err) { next(err); }
  }

  async updateUserController(req: Request, res: Response, next: NextFunction) {
    try {
      const data = UpdateUserSchema.parse(req.body);
      const user = await service.updateUserService(req.params.id, data);
      return res.status(200).json({ success: true, data: user });
    } catch (err) { next(err); }
  }

  async softDeleteUserController(req: Request, res: Response, next: NextFunction) {
    try {
      await service.softDeleteUserService(req.params.id);
      return res.status(204).send();
    } catch (err) { next(err); }
  }

  async logoutUserController(req: Request, res: Response, next: NextFunction) {
    try {
      await service.logoutUserService(req.params.id);
      return res.status(204).send();
    } catch (err) { next(err); }
  }

  async findAllUsersController(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await service.findAllUsersService();
      return res.status(200).json({ success: true, data: users });
    } catch (err) { next(err); }
  }
}
