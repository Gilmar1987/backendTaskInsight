// [Skill: service]
import { UserRepository } from '../repositories/User.Repositorie';
import { IUser } from '../models/User';
import { generateTokens } from '../config/jwt';
import bcrypt from 'bcrypt';

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
    return { user, token, refreshToken };
  }

  async logoutUserService(userId: string) {
    await this.findByIdUserService(userId);
    await repo().invalidateRefreshTokenUserRepository(userId);
  }

  async findAllUsersService() {
    return repo().findAllUsersRepository();
  }
}
