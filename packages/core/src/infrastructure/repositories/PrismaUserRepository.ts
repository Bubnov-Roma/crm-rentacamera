import { PrismaClient } from '@prisma/client';
import { IUserRepository } from '../../application/ports/repositories/IUserRepository';
import { User } from '../../domain/entities/User';
import { UserRole, UserType } from '../../infrastructure/types/user-types';

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<User | null> {
    const userData = await this.prisma.user.findUnique({
      where: { id },
      include: {
        client: true,
        employee: true,
        partner: true,
      },
    });

    if (!userData) return null;

    return this.toDomainEntity(userData);
  }

  async findByEmail(email: string): Promise<User | null> {
    const userData = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!userData) return null;

    return this.toDomainEntity(userData);
  }

  async save(user: User): Promise<void> {
    const data = {
      id: user.id,
      email: user.email,
      phone: user.phone,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      discountRate: user.discountRate,
      isActive: user.isActive,
      isVerified: user.isVerified,
      avatar: user.avatar,
      lastLoginAt: user.lastLoginAt,
      updatedAt: new Date(),
    };

    await this.prisma.user.upsert({
      where: { id: user.id },
      create: {
        ...data,
        passwordHash: 'temp_password_hash', // TODO - replace to user.passwordHash
        createdAt: new Date(),
      },
      update: data,
    });
  }

  private toDomainEntity(prismaData: UserType): User {
    const validRoles: UserRole[] = ['ADMIN', 'MANAGER', 'CLIENT', 'PARTNER'];
    if (!validRoles.includes(prismaData.role)) {
      throw new Error(`Invalid user role from database: ${prismaData.role}`);
    }
    return User.reconstitute({
      ...prismaData,
    });
  }
}
