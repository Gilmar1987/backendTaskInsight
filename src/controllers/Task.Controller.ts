// [Skill: controller]
import { Request, Response } from 'express';
import { TaskService } from '../services/Task.Service';
import { CreateTaskSchema, UpdateTaskSchema } from '../schemas/Task.Schema';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/httpResponse';

const service = new TaskService();

export class TaskController {
  createTaskController = asyncHandler(async (req: Request, res: Response) => {
    const data = CreateTaskSchema.parse(req.body);
    const task = await service.createTaskService(
      data.title,
      data.description,
      req.user!.id,
      data.dueDate,
      data.priority,
    );
    return sendSuccess(res, 201, task);
  });

  findAllByUserTaskController = asyncHandler(
    async (req: Request, res: Response) => {
      const tasks = await service.findAllByUserTaskService(req.user!.id);
      return sendSuccess(res, 200, tasks);
    },
  );

  findByIdTaskController = asyncHandler(async (req: Request, res: Response) => {
    const task = await service.findByIdTaskService(req.params.id);
    return sendSuccess(res, 200, task);
  });

  updateTaskController = asyncHandler(async (req: Request, res: Response) => {
    const { deadlineChangeReason, ...taskData } = UpdateTaskSchema.parse(req.body);
    const task = await service.updateTaskService(
      req.params.id,
      taskData,
      deadlineChangeReason,
    );
    return sendSuccess(res, 200, task);
  });

  deleteTaskController = asyncHandler(async (req: Request, res: Response) => {
    await service.deleteTaskService(req.params.id);
    return res.status(204).send();
  });

  findAllTasksController = asyncHandler(async (req: Request, res: Response) => {
    const tasks = await service.findAllTasksService();
    return sendSuccess(res, 200, tasks);
  });
}
