import { Schema, model, Document, Types } from 'mongoose';

export type TaskStatus = 'pendente' | 'em andamento' | 'concluída';

export interface ITask extends Document {
  title: string;
  description: string;
  status: TaskStatus;
  user: Types.ObjectId;
  startedAt: Date | null;
  completedAt: Date | null;
  isDeleted: boolean;
  deletedAt: Date | null;
}

const taskSchema = new Schema<ITask>(
  {
    title:       { type: String, required: true },
    description: { type: String, required: true },
    status:      { type: String, enum: ['pendente', 'em andamento', 'concluída'], default: 'pendente' },
    user:        { type: Schema.Types.ObjectId, ref: 'User', required: true },
    startedAt:   { type: Date, default: null },
    completedAt: { type: Date, default: null },
    isDeleted:   { type: Boolean, default: false },
    deletedAt:   { type: Date, default: null },
  },
  { timestamps: true }
);

export const Task = model<ITask>('Task', taskSchema);
export default Task;
