// [Skill: service]
import { UserRepository } from '../repositories/User.Repositorie';
import { IUser } from '../models/User';
import { generateTokens } from '../config/jwt';
import { env } from '../config/env';
import bcrypt from 'bcrypt';
import jwt, { JwtPayload } from 'jsonwebtoken';
import crypto from 'crypto';
import { Resend } from 'resend';

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
    const resend = new Resend(env.RESEND_API_KEY);

    // Envia em segundo plano — não bloqueia a resposta ao usuário
    resend.emails.send({
      from:    'TaskFlow <onboarding@resend.dev>',
      to:      user.email,
      subject: 'Recuperação de senha — TaskFlow',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto">
          <h2 style="color:#7c3aed">Recuperação de senha</h2>
          <p>Olá, <strong>${user.name}</strong>!</p>
          <p>Recebemos uma solicitação para redefinir a senha da sua conta.</p>
          <p>Clique no botão abaixo para criar uma nova senha. O link é válido por <strong>1 hora</strong>.</p>
          <a href="${resetUrl}" style="display:inline-block;margin:16px 0;padding:12px 24px;background:#7c3aed;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold">
            Redefinir senha
          </a>
          <p style="color:#888;font-size:12px">Se você não solicitou isso, ignore este email. Sua senha permanece a mesma.</p>
        </div>
      `,
    }).catch((err: unknown) => console.error('[Email] Erro ao enviar recuperação de senha:', err));
  }

  async resetPasswordUserService(token: string, newPassword: string) {
    const user = await repo().findByResetTokenRepository(token);
    if (!user) throw new Error('Token inválido ou expirado');

    const hashed = await bcrypt.hash(newPassword, 10);
    await repo().clearResetTokenRepository(user.id, hashed);
  }
}
