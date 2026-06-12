// [Skill: service]
import { TaskRepository } from '../repositories/Task.Repositorie';
import { UserRepository } from '../repositories/User.Repositorie';
import { ITask, IDeadlineHistoryEntry } from '../models/Task';
import { emailService } from './Email.service';

const repo = () => new TaskRepository();
const userRepo = () => new UserRepository();

export class TaskService {
  async createTaskService(title: string, description: string, userId: string, dueDate: Date, priority?: string, ) {
    const existing = await repo().findByTitleNormalizedTaskRepository(title.toUpperCase().replace(/\s+/g, ''), userId);
    if (existing) throw new Error('Título já existe');

    const task = await repo().createTaskRepository(title, description, userId, priority, dueDate);

    const user = await userRepo().findByIdUserRepository(userId);
    if (user) {
      try {
      await emailService.sendTaskCreatedEmail(
        { email: user.email, name: user.name },
        { title: task.title, dueDate: dueDate  },
      );
      console.log(`[Email]: Notificação de nova tarefa enviada para ${user.email}`);
      } catch (error) {
        console.error('[Email Error]: Falha ao enviar notificação de nova tarefa', error);
      }
    }

    return task;
  }

  async findByIdTaskService(id: string) {
    const task = await repo().findByIdTaskRepository(id);
    if (!task) throw new Error('Tarefa não encontrada');
    return task;
  }

  async findAllByUserTaskService(userId: string) {
    return repo().findAllByUserTaskRepository(userId);
  }

  async updateTaskService(id: string, data: Partial<ITask>, deadlineChangeReason?: string) {
    const task = await this.findByIdTaskService(id);
    if (task.isDeleted) throw new Error('Tarefa deletada');
    const existingTitleNormalizado = await repo().findByTitleNormalizedTaskRepository(data.title?.toUpperCase().replace(/\s+/g, '') || '', task.userId.toString());
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

    if (data.dueDate && deadlineChangeReason) {
      const entry: IDeadlineHistoryEntry = {
        oldDate:   task.dueDate ?? null,
        newDate:   data.dueDate,
        reason:    deadlineChangeReason,
        changedAt: new Date(),
      };
      updateData.deadlineHistory = [...(task.deadlineHistory ?? []), entry];
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
