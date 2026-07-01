// [Skill: controller]
import { Request, Response } from 'express';
import { UserService } from '../services/User.Service';
import {
  UserSchema,
  LoginSchema,
  UpdateUserSchema,
  RefreshTokenSchema,
  UserResponseSchema,
  UserListResponseSchema,
} from '../schemas/User.Schema';
import { asyncHandler } from '../utils/asyncHandler';
import { sendMessage, sendSuccess } from '../utils/httpResponse';

const service = new UserService();

export class UserController {
  createUserController = asyncHandler(async (req: Request, res: Response) => {
    const data = UserSchema.parse(req.body);
    const user = await service.createUserService(
      data.name,
      data.email,
      data.password,
      data.role,
    );
    const userResponse = UserResponseSchema.parse(user);
    return sendSuccess(res, 201, userResponse);
  });

  loginUserController = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = LoginSchema.parse(req.body);
    const result = await service.loginUserService(email, password);
    const userResponse = UserResponseSchema.parse(result.user);
    return sendSuccess(res, 200, {
      user: userResponse,
      token: result.token,
      refreshToken: result.refreshToken,
    });
  });

  refreshTokenUserController = asyncHandler(async (
    req: Request,
    res: Response,
  ) => {
    const { refreshToken } = RefreshTokenSchema.parse(req.body);
    const result = await service.refreshTokenUserService(refreshToken);
    return sendSuccess(res, 200, result);
  });

  findByIdUserController = asyncHandler(async (req: Request, res: Response) => {
    const user = await service.findByIdUserService(req.params.id);
    const userResponse = UserResponseSchema.parse(user);
    return sendSuccess(res, 200, userResponse);
  });

  updateUserController = asyncHandler(async (req: Request, res: Response) => {
    const data = UpdateUserSchema.parse(req.body);
    const user = await service.updateUserService(req.params.id, data);
    const userResponse = UserResponseSchema.parse(user);
    return sendSuccess(res, 200, userResponse);
  });

  softDeleteUserController = asyncHandler(async (req: Request, res: Response) => {
    await service.softDeleteUserService(req.params.id);
    return res.status(204).send();
  });

  logoutUserController = asyncHandler(async (req: Request, res: Response) => {
    await service.logoutUserService(req.params.id);
    return res.status(204).send();
  });

  findAllUsersController = asyncHandler(async (req: Request, res: Response) => {
    const users = await service.findAllUsersService();
    const usersResponse = UserListResponseSchema.parse(users);
    return sendSuccess(res, 200, usersResponse);
  });

  forgotPasswordController = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email obrigatório' });
    await service.forgotPasswordUserService(email);
    return sendMessage(res, 200, 'Se o email existir, você receberá as instruções em breve.');
  });

  resetPasswordController = asyncHandler(async (req: Request, res: Response) => {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ success: false, message: 'Token e senha obrigatórios' });
    await service.resetPasswordUserService(token, password);
    return sendMessage(res, 200, 'Senha redefinida com sucesso.');
  });
}
