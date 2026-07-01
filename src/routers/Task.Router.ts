// [Skill: routes]
import { Router } from 'express';
import { TaskController } from '../controllers/Task.Controller';
import { authMiddleware } from '../midllewares/Auth.midlleware';
import { roleMiddleware } from '../midllewares/Role.midlleware';
import { validarIdMiddleware } from '../midllewares/ValidarId.midlleware';

const taskRouter = Router();
const controller = new TaskController();

taskRouter.post('/',      authMiddleware, roleMiddleware(['user', 'admin']), controller.createTaskController);
taskRouter.get('/',       authMiddleware, roleMiddleware(['user', 'admin']), controller.findAllByUserTaskController);
taskRouter.get('/all',    authMiddleware, roleMiddleware(['admin']),         controller.findAllTasksController);
taskRouter.get('/:id',    authMiddleware, roleMiddleware(['user', 'admin']), validarIdMiddleware, controller.findByIdTaskController);
taskRouter.put('/:id',    authMiddleware, roleMiddleware(['user', 'admin']), validarIdMiddleware, controller.updateTaskController);
taskRouter.delete('/:id', authMiddleware, roleMiddleware(['user','admin']),  validarIdMiddleware, controller.deleteTaskController);

export { taskRouter };
