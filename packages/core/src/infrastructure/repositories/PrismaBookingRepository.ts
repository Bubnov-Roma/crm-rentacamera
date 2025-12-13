import { PrismaClient } from '@prisma/client';
import { Booking } from 'src/domain/entities/Booking';
import { IBookingRepository } from 'src/application/ports/repositories/IBookingRepository';
import { DomainBookingStatus, PrismaBookingType, StatusMapper } from '../types/booking-types';
import { RentalPeriod } from 'src/domain/value-objects/RentalPeriod';
import { Money } from 'src/domain/value-objects/Money';

export class PrismaBookingRepository implements IBookingRepository {
  constructor(private prisma: PrismaClient) {}
  async findById(id: string): Promise<Booking | null> {
    const prismaData = await this.prisma.booking.findUnique({
      where: { id },
      include: { items: true, payments: true, services: true },
    });
    if (!prismaData) return null;
    return this.toDomainEntity(prismaData);
  }

  async save(booking: Booking): Promise<void> {
    const data = {
      id: booking.id,
      number: booking.number,
      userId: booking.userId,
      pickupLocationId: booking.pickupLocationId,
      startDate: booking.startDate,
      endDate: booking.endDate,
      status: booking.status,
      totalAmount: booking.totalAmount.amount,
      depositAmount: booking.depositAmount.amount,
      penaltyAmount: booking.penaltyAmount.amount,
      totalHours: booking.period.getDurationInHours(),
      pricingType: 'DAILY' as const,
      discountRate: 0,
      calculatedPrice: {},
      updatedAt: new Date(),
    };

    await this.prisma.booking.upsert({
      where: { id: booking.id },
      create: {
        ...data,
        createdAt: new Date(),
      },
      update: data,
    });
  }

  async findByUserId(userId: string): Promise<Booking[]> {
    const prismaData = await this.prisma.booking.findMany({
      where: { userId },
      include: { items: true, payments: true },
    });
    return prismaData.map((data) => this.toDomainEntity(data));
  }
  async updateStatus(bookingId: string, status: DomainBookingStatus): Promise<void> {
    await this.prisma.booking.update({
      where: { id: bookingId },
      data: { status },
    });
  }
  private toDomainEntity(prismaData: PrismaBookingType): Booking {
    const period = new RentalPeriod(prismaData.startDate, prismaData.endDate);
    const totalAmount = new Money(prismaData.totalAmount);
    const depositAmount = new Money(prismaData.depositAmount);
    const penaltyAmount = new Money(prismaData.penaltyAmount || 0);

    // creating Booking throw private constructor (using a factory or reconstruction)
    return Booking.reconstitute({
      id: prismaData.id,
      number: prismaData.number,
      userId: prismaData.userId,
      pickupLocationId: prismaData.pickupLocationId,
      period,
      totalAmount,
      depositAmount,
      status: StatusMapper.toDomain(prismaData.status), // TODO сделать проверку на статус до присвоения
      penaltyAmount,
      equipmentIds: [],
    });
  }
}
