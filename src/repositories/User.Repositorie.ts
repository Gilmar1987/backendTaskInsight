// [Skill: repository]
import { IUser, User } from '../models/User';

export class UserRepository {
    async createUserRepository(name: string, email: string, password: string, role: 'user' | 'admin' = 'user'): Promise<IUser> {
        return await User.create({ name, email, password, role });
    }

    async findByEmailUserRepository(email: string): Promise<IUser | null> {
        return await User.findOne({ email });
    }

    async findByIdUserRepository(id: string): Promise<IUser | null> {
        return await User.findById(id);
    }

    async updateUserRepository(userId: string, updateData: Partial<IUser>): Promise<IUser | null> {
        return await User.findByIdAndUpdate(userId, updateData, { new: true });
    }

    async updateRefreshTokenUserRepository(userId: string, refreshToken: string): Promise<void> {
        await User.findByIdAndUpdate(userId, { refreshToken }, { new: true });
    }

    async findByRefreshTokenUserRepository(refreshToken: string): Promise<IUser | null> {
        return await User.findOne({ refreshToken: refreshToken }).select('+password');
    }

    async invalidateRefreshTokenUserRepository(userId: string): Promise<void> {
        await User.findByIdAndUpdate(userId, { refreshToken: null }, { new: true });
    }

    async softDeleteUserRepository(userId: string): Promise<void> {
        await User.findByIdAndUpdate(userId, { isDeleted: true, deletedAt: new Date() }, { new: true });
        return;
    }

    async findAllUsersRepository(): Promise<IUser[]> {
        return await User.find({ isDeleted: false });
    }

    async findByEmailWithPasswordRepository(email: string): Promise<IUser | null> {
        return await User.findOne({ email }).select('+password');
    }

    async saveResetTokenRepository(userId: string, token: string, expires: Date): Promise<void> {
        await User.findByIdAndUpdate(userId, { resetPasswordToken: token, resetPasswordExpires: expires });
    }

    async findByResetTokenRepository(token: string): Promise<IUser | null> {
        return await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: new Date() },
        }).select('+password +resetPasswordToken +resetPasswordExpires');
    }

    async clearResetTokenRepository(userId: string, newPasswordHash: string): Promise<void> {
        await User.findByIdAndUpdate(userId, {
            password: newPasswordHash,
            resetPasswordToken: undefined,
            resetPasswordExpires: undefined,
        });
    }
}