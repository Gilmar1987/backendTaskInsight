// [Skill: routes]
import { Router } from 'express';
import { UserController } from '../controllers/User.Controller';
import { validarIdMiddleware } from '../midllewares/ValidarId.midlleware';
import { authMiddleware } from '../midllewares/Auth.midlleware';
import { roleMiddleware } from '../midllewares/Role.midlleware';

const userRouter = Router();
const controller = new UserController();

userRouter.post('/register',        controller.createUserController);
userRouter.post('/login',           controller.loginUserController);
userRouter.post('/refresh',         controller.refreshTokenUserController);
userRouter.post('/forgot-password', controller.forgotPasswordController);
userRouter.post('/reset-password',  controller.resetPasswordController);
userRouter.get('/',          authMiddleware, roleMiddleware(['admin']), controller.findAllUsersController);
userRouter.get('/:id',       authMiddleware, roleMiddleware(['user', 'admin']), validarIdMiddleware, controller.findByIdUserController);
userRouter.put('/:id',       authMiddleware, roleMiddleware(['user', 'admin']), validarIdMiddleware, controller.updateUserController);
userRouter.delete('/:id',    authMiddleware, roleMiddleware(['user', 'admin']), validarIdMiddleware, controller.softDeleteUserController);
userRouter.post('/:id/logout', authMiddleware, roleMiddleware(['user', 'admin']), validarIdMiddleware, controller.logoutUserController);

export { userRouter };
