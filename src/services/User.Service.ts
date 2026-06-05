// [Skill: service]
import { UserRepository } from '../repositories/User.Repositorie';
import { IUser } from '../models/User';
import { generateTokens } from '../config/jwt';
import { env } from '../config/env';
import bcrypt from 'bcrypt';
import jwt, { JwtPayload } from 'jsonwebtoken';
import crypto from 'crypto';
import { emailService } from './Email.service';

const repo = () => new UserRepository();

export class UserService {
  async createUserService(name: string, email: string, password: string, role: 'user' | 'admin' = 'user') {
    if (await repo().findByEmailUserRepository(email))
      throw new Error('Email já cadastrado');

    const hashedPassword = await bcrypt.hash(password, 10);
    return repo().createUserRepository(name, email, hashedPassword, role);
  }

  async findByEmailUserService(email: string) {
    const user = await repo().findByEmailUserRepository(email);
    if (!user) throw new Error('Email não encontrado');
    return user;
  }

  async findByIdUserService(id: string) {
    const user = await repo().findByIdUserRepository(id);
    if (!user) throw new Error('Usuário não encontrado');
    return user;
  }

  async updateUserService(userId: string, updateData: Partial<IUser>) {
    await this.findByIdUserService(userId);
    const existEmail = await repo().findByEmailUserRepository(updateData.email || '');
    if (existEmail && existEmail.id !== userId)
      throw new Error('Email já cadastrado por outro usuário');
    return repo().updateUserRepository(userId, updateData);
  }

  async updateRefreshTokenUserService(userId: string, refreshToken: string) {
    await repo().updateRefreshTokenUserRepository(userId, refreshToken);
  }

  async findByRefreshTokenUserService(refreshToken: string) {
    const user = await repo().findByRefreshTokenUserRepository(refreshToken);
    if (!user) throw new Error('Refresh token inválido');
    return user;
  }

  async invalidateRefreshTokenUserService(userId: string) {
    await repo().invalidateRefreshTokenUserRepository(userId);
  }

  async softDeleteUserService(userId: string) {
    const user = await this.findByIdUserService(userId);
    if(!user) throw new Error('Usuário não encontrado');
    if(user.isDeleted) throw new Error('Usuário já deletado');
    
    await repo().softDeleteUserRepository(userId);
  }

  async loginUserService(email: string, password: string) {
    const user = await repo().findByEmailWithPasswordRepository(email);
    if (!user || user.isDeleted) throw new Error('Credenciais inválidas');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new Error('Credenciais inválidas');

    const { token, refreshToken } = generateTokens(user.id, user.role);
    await repo().updateRefreshTokenUserRepository(user.id, refreshToken);
    return { user, token, refreshToken };
  }

  async refreshTokenUserService(refreshToken: string) {
    const user = await repo().findByRefreshTokenUserRepository(refreshToken);
    if (!user) throw new Error('Refresh token inválido');

    try {
      jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as JwtPayload;
    } catch {
      await repo().invalidateRefreshTokenUserRepository(user.id);
      throw new Error('Refresh token expirado');
    }

    const { token, refreshToken: newRefreshToken } = generateTokens(user.id, user.role);
    await repo().updateRefreshTokenUserRepository(user.id, newRefreshToken);
    return { token, refreshToken: newRefreshToken };
  }

  async logoutUserService(userId: string) {
    await this.findByIdUserService(userId);
    await repo().invalidateRefreshTokenUserRepository(userId);
  }

  async findAllUsersService() {
    return repo().findAllUsersRepository();
  }

  async forgotPasswordUserService(email: string) {
    const user = await repo().findByEmailUserRepository(email);
    if (!user || user.isDeleted) return; // não revelar se email existe

    const token   = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora
    await repo().saveResetTokenRepository(user.id, token, expires);

    const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${token}`;

    emailService.sendPasswordResetEmail(user, resetUrl).catch((err: unknown) => {
      const message = err instanceof Error ? err.message.replace(/[\r\n]/g, ' ') : 'Erro desconhecido';
      console.error('[Email] Erro ao enviar recuperação de senha:', message);
    });
  }

  async resetPasswordUserService(token: string, newPassword: string) {
    const user = await repo().findByResetTokenRepository(token);
    if (!user) throw new Error('Token inválido ou expirado');

    const hashed = await bcrypt.hash(newPassword, 10);
    await repo().clearResetTokenRepository(user.id, hashed);
  }
}
