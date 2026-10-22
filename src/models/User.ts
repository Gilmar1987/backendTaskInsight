// [Skill: repository]
import { Schema, model, Document, InferSchemaType } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  refreshToken?: string;
  isDeleted: boolean;
  deletedAt: Date | null;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
}

const userSchema = new Schema<IUser>(
  {
    name:                 { type: String, required: true },
    email:                { type: String, required: true, unique: true },
    password:             { type: String, required: true, select: false },
    role:                 { type: String, enum: ['user', 'admin'], default: 'user' },
    refreshToken:         { type: String, select: false },
    isDeleted:            { type: Boolean, default: false },
    deletedAt:            { type: Date, default: null },
    resetPasswordToken:   { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

// Remove campos sensíveis ao converter para objeto/JSON
const removeSensitive = (_doc: unknown, ret: unknown) => {
  if (typeof ret === 'object' && ret !== null) {
    const sanitized = ret as Record<string, unknown>;
    delete sanitized.password;
    delete sanitized.refreshToken;
    delete sanitized.resetPasswordToken;
    delete sanitized.resetPasswordExpires;
  }

  return ret;
};

userSchema.set('toJSON', { transform: removeSensitive });
userSchema.set('toObject', { transform: removeSensitive });

export const User = model<IUser>('User', userSchema);
export type UserType = InferSchemaType<typeof userSchema>;
export default User;