// [Skill: controller]
import { Request, Response } from 'express';
import { UserService } from '../services/User.Service';
import { UserSchema, LoginSchema, UpdateUserSchema } from '../schemas/User.Schema';

const service = new UserService();

export class UserController {
  async createUserController(req: Request, res: Response) {
    const data = UserSchema.parse(req.body);
    const user = await service.createUserService(data.name, data.email, data.password, data.role);
    return res.status(201).json({ success: true, data: user });
  }

  async loginUserController(req: Request, res: Response) {
    const { email, password } = LoginSchema.parse(req.body);
    const result = await service.loginUserService(email, password);
    return res.status(200).json({ success: true, data: result });
  }

  async findByIdUserController(req: Request, res: Response) {
    const user = await service.findByIdUserService(req.params.id);
    return res.status(200).json({ success: true, data: user });
  }

  async updateUserController(req: Request, res: Response) {
    const data = UpdateUserSchema.parse(req.body);
    const user = await service.updateUserService(req.params.id, data);
    return res.status(200).json({ success: true, data: user });
  }

  async softDeleteUserController(req: Request, res: Response) {
    await service.softDeleteUserService(req.params.id);
    return res.status(204).send();
  }

  async logoutUserController(req: Request, res: Response) {
    await service.logoutUserService(req.params.id);
    return res.status(204).send();
  }
}
