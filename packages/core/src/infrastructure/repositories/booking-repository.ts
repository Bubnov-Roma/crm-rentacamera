import { PrismaClient } from '@prisma/client';
import { Booking, Money, RentalPeriod } from '../../domain/entities/Booking';
import { IBookingRepository } from '../interfaces/IBookingRepository';
import { StatusMapper } from '../types/booking-types';

type PrismaBookingData = {
  id: string;
  number: string;
  userId: string;
  pickupLocationId: string;
  startDate: Date;
  endDate: Date;
  status: string;
  totalAmount: number;
  depositAmount: number;
  penaltyAmount: number | null;
  totalHours: number | null;
  pricingType: string | null;
  discountRate: number | null;
  calculatedPrice: unknown | null;
  parentBookingId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export class PrismaBookingRepository implements IBookingRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<Booking | null> {
    const prismaData = await this.prisma.booking.findUnique({
      where: { id },
      include: { items: true, payments: true, services: true },
    });

    if (!prismaData) return null;

    // from Prisma to Domain Entity
    return this.toDomainEntity(prismaData);
  }

  async save(booking: Booking): Promise<void> {
    const createData = {
      id: booking.id,
      number: booking.number,
      userId: booking.userId,
      pickupLocationId: booking.pickupLocationId,
      startDate: booking.startDate,
      endDate: booking.endDate,
      status: StatusMapper.toPrisma(booking.status),
      totalAmount: booking.totalAmount.amount,
      depositAmount: booking.depositAmount.amount,
      penaltyAmount: booking.penaltyAmount.amount,
      totalHours: booking.period.getDurationInHours(),
      pricingType: 'DAILY' as const,
      discountRate: 0,
      calculatedPrice: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updateData = {
      number: booking.number,
      userId: booking.userId,
      pickupLocationId: booking.pickupLocationId,
      startDate: booking.startDate,
      endDate: booking.endDate,
      status: StatusMapper.toPrisma(booking.status),
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
      create: createData,
      update: updateData,
    });
  }

  async findByUserId(userId: string): Promise<Booking[]> {
    const prismaData = await this.prisma.booking.findMany({
      where: { userId },
      include: { items: true, payments: true },
    });
    return prismaData.map((data) => this.toDomainEntity(data));
  }

  async updateStatus(
    bookingId: string,
    status: import('@prisma/client').BookingStatus,
  ): Promise<void> {
    await this.prisma.booking.update({
      where: { id: bookingId },
      data: { status },
    });
  }

  private toDomainEntity(prismaData: PrismaBookingData): Booking {
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
      status: StatusMapper.toDomain(prismaData.status),
      penaltyAmount,
    });
  }
}
