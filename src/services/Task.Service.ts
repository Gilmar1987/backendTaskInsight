// [Skill: service]
import { TaskRepository } from '../repositories/Task.Repositorie';
import { ITask } from '../models/Task';

const repo = () => new TaskRepository();

export class TaskService {
  async createTaskService(title: string, description: string, userId: string, priority?: string, dueDate?: Date) {
    const existing = await repo().findByTitleNormalizedTaskRepository(title.toUpperCase().replace(/\s+/g, ''));
    if (existing) throw new Error('Título já existe');
    return repo().createTaskRepository(title, description, userId, priority, dueDate);
  }

  async findByIdTaskService(id: string) {
    const task = await repo().findByIdTaskRepository(id);
    if (!task) throw new Error('Tarefa não encontrada');
    return task;
  }

  async findAllByUserTaskService(userId: string) {
    return repo().findAllByUserTaskRepository(userId);
  }

  async updateTaskService(id: string, data: Partial<ITask>) {
    const task = await this.findByIdTaskService(id);
    if(task.isDeleted) throw new Error('Tarefa deletada');
    if(!task) throw new Error('Tarefa não encontrada');
    const existingTitleNormalizado = await repo().findByTitleNormalizedTaskRepository(data.title?.toUpperCase().replace(/\s+/g, '') || '');
    if (existingTitleNormalizado && existingTitleNormalizado._id.toString() !== id) {
      throw new Error('Título já existe');
    }
    const updateData: Partial<ITask> = { ...data };

    if (data.status && data.status !== task.status) {
      const transitions: Record<string, string[]> = {
        'PENDING':     ['IN_PROGRESS', 'CANCELLED'],
        'IN_PROGRESS': ['DONE', 'CANCELLED'],
        'DONE':        [],
        'CANCELLED':   [],
      };

      const allowed = transitions[task.status];
      if (!allowed.includes(data.status))
        throw new Error(`Transição inválida: ${task.status} → ${data.status}`);

      if (data.status === 'IN_PROGRESS') updateData.startedAt = new Date();
      if (data.status === 'DONE')        updateData.completedAt = new Date();
    }

    return repo().updateTaskRepository(id, updateData);
  }

  async deleteTaskService(id: string) {
    const task = await this.findByIdTaskService(id);
    if (task.isDeleted) throw new Error('Tarefa já deletada');
    await repo().softDeleteTaskRepository(id);
  }

  async findAllTasksService() {
    return repo().findAllTasksRepository();
  }
}
