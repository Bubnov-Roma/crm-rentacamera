import { PrismaClient } from '@prisma/client';
import { IUserRepository } from '../interfaces';
import { User } from 'src/domain/entities/User';

export class PrismaUserRepository implements IUserRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<User | null> {
    const userData = await this.prisma.user.findUnique({
      where: { id },
      include: {
        client: true,
        employee: true,
      },
    });

    if (!userData) return null;

    return User.fromPrisma(userData);
  }

  async findByEmail(email: string): Promise<User | null> {
    const userData = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!userData) return null;

    return User.fromPrisma(userData);
  }

  async save(user: User): Promise<void> {
    const userData = user.toPrisma();

    await this.prisma.user.upsert({
      where: { id: user.id },
      create: {
        id: userData.id,
        email: user.email,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        passwordHash: 'temp_password_hash', //TODO: replace into user.passwordHash
        isActive: userData.isActive,
        isVerified: userData.isVerified,
        avatar: userData.avatar,
        lastLoginAt: userData.lastLoginAt,
        createdAt: userData.createdAt || new Date(),
        updatedAt: userData.updatedAt || new Date(),
      },
      update: {
        email: user.email,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        role: userData.role,
        discountRate: userData.discountRate,
        isActive: userData.isActive,
        isVerified: userData.isVerified,
        avatar: userData.avatar,
        lastLoginAt: userData.lastLoginAt,
        updatedAt: new Date(),
      },
    });
  }
}
