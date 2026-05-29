// [Skill: routes]
import { Router } from 'express';
import { UserController } from '../controllers/User.Controller';
import { validarIdMiddleware } from '../midllewares/ValidarId.midlleware';
import { authMiddleware } from '../midllewares/Auth.midlleware';
import { roleMiddleware } from '../midllewares/Role.midlleware';

const userRouter = Router();
const controller = new UserController();

userRouter.post('/register', (req, res, next) => controller.createUserController(req, res, next));
userRouter.post('/login',    (req, res, next) => controller.loginUserController(req, res, next));
userRouter.get('/',          authMiddleware, roleMiddleware(['admin']), (req, res, next) => controller.findAllUsersController(req, res, next));
userRouter.get('/:id',       authMiddleware, roleMiddleware(['user', 'admin']), validarIdMiddleware, (req, res, next) => controller.findByIdUserController(req, res, next));
userRouter.put('/:id',       authMiddleware, roleMiddleware(['user', 'admin']), validarIdMiddleware, (req, res, next) => controller.updateUserController(req, res, next));
userRouter.delete('/:id',    authMiddleware, roleMiddleware(['user', 'admin']), validarIdMiddleware, (req, res, next) => controller.softDeleteUserController(req, res, next));
userRouter.post('/:id/logout', authMiddleware, roleMiddleware(['user', 'admin']), validarIdMiddleware, (req, res, next) => controller.logoutUserController(req, res, next));

export { userRouter };
