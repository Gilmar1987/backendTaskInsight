// [Skill: repository]
import { ITask, Task } from '../models/Task';
import { Types } from 'mongoose';
import { normalizeTitle } from '../utils/normalizeTitle';

export class TaskRepository {
  async createTaskRepository(title: string, description: string, userId: string, priority?: string, dueDate?: Date): Promise<ITask> {
    const titleNormalized = normalizeTitle(title);
    return await Task.create({ title, titleNormalized, description, userId: new Types.ObjectId(userId), priority, dueDate });
  }

  async findByTitleNormalizedTaskRepository(titleNormalized: string, userId: string): Promise<ITask | null> {
    return await Task.findOne({ titleNormalized, userId, isDeleted: false });
  }

  async findByIdTaskRepository(id: string): Promise<ITask | null> {
    return await Task.findOne({ _id: id, isDeleted: false });
  }

  async findAllByUserTaskRepository(userId: string): Promise<ITask[]> {
    return await Task.find({ userId: new Types.ObjectId(userId), isDeleted: false });
  }

  async findAllTasksRepository(): Promise<ITask[]> {
    return await Task.find({ isDeleted: false });
  }

  async updateTaskRepository(id: string, data: Partial<ITask>): Promise<ITask | null> {
    if (data.title) {
      data.titleNormalized = normalizeTitle(data.title);
    }
    return await Task.findByIdAndUpdate(id, data, { new: true });
  }

  async softDeleteTaskRepository(id: string): Promise<void> {
    await Task.findByIdAndUpdate(id, { isDeleted: true, deletedAt: new Date() });
  }
}
