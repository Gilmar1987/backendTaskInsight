// [Skill: routes]
import { Router } from 'express';
import { TaskController } from '../controllers/Task.Controller';
import { authMiddleware } from '../midllewares/Auth.midlleware';
import { roleMiddleware } from '../midllewares/Role.midlleware';
import { validarIdMiddleware } from '../midllewares/ValidarId.midlleware';

const taskRouter = Router();
const controller = new TaskController();

taskRouter.post('/',      authMiddleware, roleMiddleware(['user', 'admin']), (req, res, next) => controller.createTaskController(req, res, next));
taskRouter.get('/',       authMiddleware, roleMiddleware(['user', 'admin']), (req, res, next) => controller.findAllByUserTaskController(req, res, next));
taskRouter.get('/all',    authMiddleware, roleMiddleware(['admin']),         (req, res, next) => controller.findAllTasksController(req, res, next));
taskRouter.get('/:id',    authMiddleware, roleMiddleware(['user', 'admin']), validarIdMiddleware, (req, res, next) => controller.findByIdTaskController(req, res, next));
taskRouter.put('/:id',    authMiddleware, roleMiddleware(['user', 'admin']), validarIdMiddleware, (req, res, next) => controller.updateTaskController(req, res, next));
taskRouter.delete('/:id', authMiddleware, roleMiddleware(['user','admin']),  validarIdMiddleware, (req, res, next) => controller.deleteTaskController(req, res, next));

export { taskRouter };
