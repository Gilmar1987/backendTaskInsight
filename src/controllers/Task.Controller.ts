// [Skill: controller]
import { Request, Response, NextFunction } from 'express';
import { TaskService } from '../services/Task.Service';
import { CreateTaskSchema, UpdateTaskSchema } from '../schemas/Task.Schema';

const service = new TaskService();

export class TaskController {
  async createTaskController(req: Request, res: Response, next: NextFunction) {
    try {
      const data = CreateTaskSchema.parse(req.body);
      const task = await service.createTaskService(data.title, data.description, req.user!.id, data.dueDate, data.priority, );
      return res.status(201).json({ success: true, data: task });
    } catch (err) { next(err); }
  }

  async findAllByUserTaskController(req: Request, res: Response, next: NextFunction) {
    try {
      const tasks = await service.findAllByUserTaskService(req.user!.id);
      return res.status(200).json({ success: true, data: tasks });
    } catch (err) { next(err); }
  }

  async findByIdTaskController(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await service.findByIdTaskService(req.params.id);
      return res.status(200).json({ success: true, data: task });
    } catch (err) { next(err); }
  }

  async updateTaskController(req: Request, res: Response, next: NextFunction) {
    try {
      const { deadlineChangeReason, ...taskData } = UpdateTaskSchema.parse(req.body);
      const task = await service.updateTaskService(req.params.id, taskData, deadlineChangeReason);
      return res.status(200).json({ success: true, data: task });
    } catch (err) { next(err); }
  }

  async deleteTaskController(req: Request, res: Response, next: NextFunction) {
    try {
      await service.deleteTaskService(req.params.id);
      return res.status(204).send();
    } catch (err) { next(err); }
  }

  async findAllTasksController(req: Request, res: Response, next: NextFunction) {
    try {
      const tasks = await service.findAllTasksService();
      return res.status(200).json({ success: true, data: tasks });
    } catch (err) { next(err); }
  }
}
