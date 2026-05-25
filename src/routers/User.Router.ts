// [Skill: routes]
import { Router } from 'express';
import { UserController } from '../controllers/User.Controller';
import { validarIdMiddleware } from '../midllewares/ValidarId.midlleware';
import { authMiddleware } from '../midllewares/Auth.midlleware';

const userRouter = Router();
const controller = new UserController();

userRouter.post('/register', (req, res) => controller.createUserController(req, res));
userRouter.post('/login', (req, res) => controller.loginUserController(req, res));
userRouter.get('/:id', validarIdMiddleware, (req, res) => controller.findByIdUserController(req, res));
userRouter.put('/:id', validarIdMiddleware, (req, res) => controller.updateUserController(req, res));
userRouter.delete('/:id', validarIdMiddleware, (req, res) => controller.softDeleteUserController(req, res));
userRouter.post('/:id/logout', validarIdMiddleware, authMiddleware, (req, res) => controller.logoutUserController(req, res));

export { userRouter };
