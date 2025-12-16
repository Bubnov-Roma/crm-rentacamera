import { PrismaClient } from '@prisma/client';
import { IEquipmentRepository } from 'src/application/ports/repositories/IEquipmentRepository';
import {
  Equipment,
  EquipmentData,
  EquipmentSpecifications,
  EquipmentStatus,
} from 'src/domain/entities/Equipment';
import { Money } from 'src/domain/value-objects/Money';

export interface PrismaEquipment {
  readonly id: string;
  readonly sku: string;
  readonly name: string;
  readonly description: string | null;
  readonly categoryId: string;
  readonly brand: string;
  readonly model: string;
  readonly serialNumber: string;
  readonly specifications: string | number | boolean | object | null;
  readonly baseHourlyRate: number;
  readonly baseDailyRate: number;
  readonly baseMonthlyRate: number;
  readonly depositAmount: number;
  readonly replacementCost: number;
  readonly pricingMatrix: string | number | boolean | object | null;
  readonly tags: string[];
  readonly comments: string | null;
  readonly images: string[];
  readonly manuals: string[];
  readonly status: string;
  readonly isPublic: boolean;
  readonly partnerId: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly category: {
    readonly id: string;
    readonly name: string;
  };
  readonly partner: {
    readonly id: string;
    readonly userId: string;
  } | null;
  readonly instances: Array<{
    readonly id: string;
    readonly status: string;
  }>;
}

export class PrismaEquipmentRepository implements IEquipmentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async isAvailable(equipmentInstanceId: string, startDate: Date, endDate: Date): Promise<boolean> {
    const conflictingBookings = await this.prisma.bookingItem.count({
      where: {
        equipmentInstanceId,
        booking: {
          OR: [
            {
              startDate: { lte: endDate },
              endDate: { gte: startDate },
            },
            {
              startDate: { lte: endDate },
              endDate: { gte: startDate },
            },
          ],
          status: {
            in: ['CONFIRMED', 'ACTIVE'],
          },
        },
      },
    });
    return conflictingBookings === 0;
  }

  async findById(id: string): Promise<Equipment | null> {
    const prismaData = await this.prisma.equipment.findUnique({
      where: { id },
      include: {
        category: true,
        partner: true,
        instances: {
          where: { status: 'AVAILABLE' },
        },
      },
    });
    if (!prismaData) return null;
    return this.toDomainEntity(prismaData);
  }

  async findByCategory(categoryId: string): Promise<Equipment[]> {
    const prismaData = await this.prisma.equipment.findMany({
      where: {
        categoryId,
        status: 'ACTIVE',
        isPublic: true,
      },
      include: {
        category: true,
        partner: true,
        instances: {
          where: { status: 'AVAILABLE' },
        },
      },
    });
    return prismaData.map((data) => this.toDomainEntity(data));
  }
  async save(equipment: Equipment): Promise<void> {
    const data: EquipmentData = equipment.toPrisma();

    const specificationsJson = data.specifications instanceof EquipmentSpecifications;

    const createData = {
      id: data.id,
      sku: data.sku,
      name: data.name,
      description: data.description,
      categoryId: data.categoryId,
      brand: data.brand,
      model: data.model,
      serialNumber: data.serialNumber,
      specifications: specificationsJson,
      baseHourlyRate: data.baseHourlyRate.amount,
      baseDailyRate: data.baseDailyRate.amount,
      baseMonthlyRate: data.baseMonthlyRate.amount,
      depositAmount: data.depositAmount.amount,
      replacementCost: data.replacementCost.amount,
      pricingMatrix: data.pricingMatrix,
      tags: data.tags,
      comments: data.comments,
      images: data.images,
      manuals: data.manuals,
      status: data.status,
      isPublic: data.isPublic,
      partnerId: data.partnerId,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };

    const updateData = {
      sku: data.sku,
      name: data.name,
      description: data.description,
      categoryId: data.categoryId,
      brand: data.brand,
      model: data.model,
      serialNumber: data.serialNumber,
      specifications: specificationsJson,
      baseHourlyRate: data.baseHourlyRate.amount,
      baseDailyRate: data.baseDailyRate.amount,
      baseMonthlyRate: data.baseMonthlyRate.amount,
      depositAmount: data.depositAmount.amount,
      replacementCost: data.replacementCost.amount,
      pricingMatrix: data.pricingMatrix,
      tags: data.tags,
      comments: data.comments,
      images: data.images,
      manuals: data.manuals,
      status: data.status,
      isPublic: data.isPublic,
      partnerId: data.partnerId,
      updatedAt: data.updatedAt,
    };
    await this.prisma.equipment.upsert({
      where: { id: equipment.id },
      create: createData,
      update: updateData,
    });
  }
  async findAvailableByCategory(categoryId: string): Promise<Equipment[]> {
    const prismaData = await this.prisma.equipment.findMany({
      where: {
        categoryId,
        status: 'ACTIVE',
        isPublic: true,
        instances: {
          some: {
            status: 'AVAILABLE',
          },
        },
      },
      include: {
        category: true,
        partner: true,
        instances: {
          where: { status: 'AVAILABLE' },
        },
      },
    });
    return prismaData.map((data) => this.toDomainEntity(data));
  }
  async updateStatus(equipmentId: string, status: EquipmentStatus): Promise<void> {
    await this.prisma.equipment.update({
      where: { id: equipmentId },
      data: {
        status,
        updatedAt: new Date(),
      },
    });
  }
  async findByPartner(partnerId: string): Promise<Equipment[]> {
    const prismaData = await this.prisma.equipment.findMany({
      where: {
        partnerId,
        status: 'ACTIVE',
      },
      include: {
        category: true,
        partner: true,
        instances: true,
      },
    });
    return prismaData.map((data) => this.toDomainEntity(data));
  }

  private toDomainEntity(prismaData: PrismaEquipment): Equipment {
    const validStatuses: EquipmentStatus[] = ['ACTIVE', 'INACTIVE', 'DISCONTINUED'];
    if (!validStatuses.includes(prismaData.status as EquipmentStatus)) {
      throw new Error(`Invalid equipment status from database: ${prismaData.status}`);
    }

    const specifications = prismaData.specifications as EquipmentSpecifications;

    const pricingMatrixJson = String(prismaData.pricingMatrix);

    const createMoneyData = (amount: number): Money => ({
      amount,
      currency: 'RUB',
    });

    return Equipment.reconstitute({
      id: prismaData.id,
      sku: prismaData.sku,
      name: prismaData.name,
      description: prismaData.description,
      categoryId: prismaData.categoryId,
      brand: prismaData.brand,
      model: prismaData.model,
      serialNumber: prismaData.serialNumber,
      specifications,
      baseHourlyRate: createMoneyData(prismaData.baseHourlyRate),
      baseDailyRate: createMoneyData(prismaData.baseDailyRate),
      baseMonthlyRate: createMoneyData(prismaData.baseMonthlyRate),
      depositAmount: createMoneyData(prismaData.depositAmount),
      replacementCost: createMoneyData(prismaData.replacementCost),
      pricingMatrix: pricingMatrixJson,
      tags: prismaData.tags || [],
      images: prismaData.images || [],
      manuals: prismaData.manuals || [],
      status: prismaData.status as EquipmentStatus,
      isPublic: prismaData.isPublic,
      partnerId: prismaData.partnerId || undefined,
      createdAt: prismaData.createdAt,
      updatedAt: prismaData.updatedAt,
      comments: prismaData.comments,
    });
  }
}
