import { PrismaClient } from '@prisma/client';
import { ITransferRepository } from 'src/application/ports/repositories/ITransferRepository';
import { EquipmentTransfer, TransferData, TransferStatus } from 'src/domain/entities/Transfer';

interface PrismaTransferData {
  readonly id: string;
  readonly equipmentInstanceId: string;
  readonly fromLocationId: string;
  readonly toLocationId: string;
  readonly bookingItemId: string | null;
  readonly status: TransferStatus;
  readonly scheduledDate: Date;
  readonly estimatedArrival: Date;
  readonly actualArrival: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

// Type Guards
function isValidTransferStatus(status: string): status is TransferStatus {
  return ['PENDING', 'SCHEDULED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'].includes(status);
}

function isValidPrismaStatus(status: string): status is TransferStatus {
  return isValidTransferStatus(status);
}

export class PrismaTransferRepository implements ITransferRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(transfer: EquipmentTransfer): Promise<void> {
    if (!isValidTransferStatus(transfer.status)) {
      throw new Error(`Invalid transfer status: ${transfer.status}`);
    }

    const data = {
      id: transfer.id,
      equipmentInstanceId: transfer.equipmentInstanceId,
      fromLocationId: transfer.fromLocationId,
      toLocationId: transfer.toLocationId,
      bookingItemId: transfer.associatedBookingId || null,
      scheduledDate: transfer.scheduledDeparture,
      estimatedArrival: transfer.estimatedArrival,
      actualArrival: transfer.actualArrival || null,
      status: transfer.status,
      updatedAt: new Date(),
    };

    await this.prisma.equipmentTransfer.upsert({
      where: { id: transfer.id },
      create: {
        ...data,
        createdAt: new Date(),
      },
      update: data,
    });
  }

  async findById(id: string): Promise<EquipmentTransfer | null> {
    const transferData = await this.prisma.equipmentTransfer.findUnique({
      where: { id },
    });
    if (!transferData) {
      return null;
    }
    if (!isValidPrismaStatus(transferData.status)) {
      throw new Error(`Invalid status from database: ${transferData.status}`);
    }
    return this.mapPrismaToDomain(transferData);
  }

  async findByEquipmentInstance(equipmentInstanceId: string): Promise<EquipmentTransfer[]> {
    const transfersData = await this.prisma.equipmentTransfer.findMany({
      where: { equipmentInstanceId },
      orderBy: { scheduledDate: 'asc' },
    });
    return transfersData.map((data: PrismaTransferData) => this.mapPrismaToDomain(data));
  }

  async findConflictingTransfers(
    equipmentInstanceId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<EquipmentTransfer[]> {
    const transfersData = await this.prisma.equipmentTransfer.findMany({
      where: {
        equipmentInstanceId,
        status: { in: ['PENDING', 'SCHEDULED', 'IN_TRANSIT'] },
        OR: [
          {
            scheduledDate: { lte: endDate },
            estimatedArrival: { gte: startDate },
          },
          {
            scheduledDate: { lte: endDate },
            estimatedArrival: { gte: startDate },
          },
        ],
      },
    });
    return transfersData.map((data: PrismaTransferData) => this.mapPrismaToDomain(data));
  }

  async updateStatus(transferId: string, status: string): Promise<void> {
    if (!isValidTransferStatus(status)) {
      throw new Error(`Invalid status in mapPrismaToDomain: ${status}`);
    }
    await this.prisma.equipmentTransfer.update({
      where: { id: transferId },
      data: {
        status,
        updatedAt: new Date(),
      },
    });
  }

  async findByStatus(status: TransferData['status']): Promise<EquipmentTransfer[]> {
    const transfersData = await this.prisma.equipmentTransfer.findMany({
      where: { status },
      orderBy: { scheduledDate: 'asc' },
    });
    return transfersData.map((data: PrismaTransferData) => this.mapPrismaToDomain(data));
  }

  async findPendingTransfers(): Promise<EquipmentTransfer[]> {
    return this.findByStatus('PENDING');
  }

  async findScheduledTransfers(): Promise<EquipmentTransfer[]> {
    return this.findByStatus('SCHEDULED');
  }

  async findInTransitTransfers(): Promise<EquipmentTransfer[]> {
    return this.findByStatus('IN_TRANSIT');
  }

  private mapPrismaToDomain(prismaData: PrismaTransferData): EquipmentTransfer {
    if (!isValidTransferStatus(prismaData.status)) {
      throw new Error(`Invalid status in mapPrismaToDomain: ${prismaData.status}`);
    }

    return EquipmentTransfer.reconstitute({
      id: prismaData.id,
      equipmentInstanceId: prismaData.equipmentInstanceId,
      fromLocationId: prismaData.fromLocationId,
      toLocationId: prismaData.toLocationId,
      scheduledDeparture: prismaData.scheduledDate,
      estimatedArrival: prismaData.estimatedArrival,
      actualDeparture: undefined,
      actualArrival: prismaData.actualArrival || undefined,
      status: prismaData.status,
      transferType: prismaData.bookingItemId ? 'BOOKING_RELATED' : 'STOCK_BALANCE',
      associatedBookingId: prismaData.bookingItemId || undefined,
      notes: undefined,
      createdAt: prismaData.createdAt,
      updatedAt: prismaData.updatedAt,
    });
  }
}
