// [Skill: controller]
import { Request, Response } from 'express';
import { TaskService } from '../services/Task.Service';
import { CreateTaskSchema, UpdateTaskSchema } from '../schemas/Task.Schema';

const service = new TaskService();

export class TaskController {
  async createTaskController(req: Request, res: Response) {
    const data = CreateTaskSchema.parse(req.body);
    const task = await service.createTaskService(
      data.title,
      data.description,
      req.user!.id,
      data.priority,
      data.dueDate
    );
    return res.status(201).json({ success: true, data: task });
  }

  async findAllByUserTaskController(req: Request, res: Response) {
    const tasks = await service.findAllByUserTaskService(req.user!.id);
    return res.status(200).json({ success: true, data: tasks });
  }

  async findByIdTaskController(req: Request, res: Response) {
    const task = await service.findByIdTaskService(req.params.id);
    return res.status(200).json({ success: true, data: task });
  }

  async updateTaskController(req: Request, res: Response) {
    const data = UpdateTaskSchema.parse(req.body);
    const task = await service.updateTaskService(req.params.id, data);
    return res.status(200).json({ success: true, data: task });
  }

  async deleteTaskController(req: Request, res: Response) {
    await service.deleteTaskService(req.params.id);
    return res.status(204).send();
  }
}
