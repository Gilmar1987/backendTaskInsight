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
  emailConfirmToken?: string;
  emailConfirmed: boolean;
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
    emailConfirmToken:    { type: String, select: false },
    emailConfirmed:       { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const User = model<IUser>('User', userSchema);
export type UserType = InferSchemaType<typeof userSchema>;
export default User;
