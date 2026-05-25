// [Skill: routes]
import { Router } from 'express';
import { TaskController } from '../controllers/Task.Controller';
import { authMiddleware } from '../midllewares/Auth.midlleware';
import { validarIdMiddleware } from '../midllewares/ValidarId.midlleware';

const taskRouter = Router();
const controller = new TaskController();

taskRouter.use(authMiddleware);

taskRouter.post('/',      (req, res) => controller.createTaskController(req, res));
taskRouter.get('/',       (req, res) => controller.findAllByUserTaskController(req, res));
taskRouter.get('/:id',    validarIdMiddleware, (req, res) => controller.findByIdTaskController(req, res));
taskRouter.put('/:id',    validarIdMiddleware, (req, res) => controller.updateTaskController(req, res));
taskRouter.delete('/:id', validarIdMiddleware, (req, res) => controller.deleteTaskController(req, res));

export { taskRouter };
