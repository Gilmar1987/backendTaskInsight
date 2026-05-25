// [Skill: service]
import { TaskRepository } from '../repositories/Task.Repositorie';
import { ITask } from '../models/Task';

const repo = () => new TaskRepository();

export class TaskService {
  async createTaskService(title: string, description: string, userId: string) {
    return repo().createTaskRepository(title, description, userId);
  }

  async findByIdTaskService(id: string) {
    const task = await repo().findByIdTaskRepository(id);
    if (!task) throw new Error('Tarefa não encontrada');
    return task;
  }

  async findAllByUserTaskService(userId: string) {
    const tasks = await repo().findAllByUserTaskRepository(userId);
    if (tasks.length === 0) throw new Error('Nenhuma tarefa encontrada para este usuário');
    return tasks;
  }

  async updateTaskService(id: string, data: Partial<ITask>) {
    const task = await this.findByIdTaskService(id);

    const updateData: Partial<ITask> = { ...data };

    if (data.status && data.status !== task.status) {
      if (data.status === 'em andamento') updateData.startedAt = new Date();
      if (data.status === 'concluída')    updateData.completedAt = new Date();
    }

    return repo().updateTaskRepository(id, updateData);
  }

  async deleteTaskService(id: string) {
    const task = await this.findByIdTaskService(id);
    if (task.isDeleted) throw new Error('Tarefa já deletada');
    await repo().softDeleteTaskRepository(id);
  }
}
