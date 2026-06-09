import { Schema, model, Document, Types } from 'mongoose';

export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface IDeadlineHistoryEntry {
  oldDate: Date | null;
  newDate: Date;
  reason: string;
  changedAt: Date;
}

export interface ITask extends Document {
  title: string;
  titleNormalized: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  userId: Types.ObjectId;
  startedAt: Date | null;
  completedAt: Date | null;
  dueDate: Date ;
  deadlineHistory: IDeadlineHistoryEntry[];
  isDeleted: boolean;
  deletedAt: Date | null;
}

const taskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 120
    },
    titleNormalized: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000
    },

    status: {
      type: String,
      enum: ['PENDING', 'IN_PROGRESS', 'DONE', 'CANCELLED'],
      default: 'PENDING'
    },

    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH'],
      default: 'MEDIUM'
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },

    startedAt: {
      type: Date,
      default: null
    },

    completedAt: {
      type: Date,
      default: null
    },

    dueDate: {
      type: Date,
      required: [true, 'Data de vencimento é obrigatória']
      
    },

    deadlineHistory: {
      type: [
        {
          oldDate:   { type: Date,   default: null },
          newDate:   { type: Date,   required: true },
          reason:    { type: String, required: true, trim: true, maxlength: 500 },
          changedAt: { type: Date,   required: true, default: Date.now }
        }
      ],
      default: []
    },

    isDeleted: {
      type: Boolean,
      default: false,
      index: true
    },

    deletedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

export const Task = model<ITask>('Task', taskSchema);
export default Task;
