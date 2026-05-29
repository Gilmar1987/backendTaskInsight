// [Skill: repository]
import { ITask, Task } from '../models/Task';
import { Types } from 'mongoose';

export class TaskRepository {
  async createTaskRepository(title: string, description: string, userId: string, priority?: string, dueDate?: Date): Promise<ITask> {
    return await Task.create({ title, description, userId: new Types.ObjectId(userId), priority, dueDate });
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
    return await Task.findByIdAndUpdate(id, data, { new: true });
  }

  async softDeleteTaskRepository(id: string): Promise<void> {
    await Task.findByIdAndUpdate(id, { isDeleted: true, deletedAt: new Date() });
  }
}
