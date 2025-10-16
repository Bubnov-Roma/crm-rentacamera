import { Prisma, PrismaClient, BookingStatus as PrismaBookingStatus } from '@prisma/client';
import {
  Booking,
  Money,
  RentalPeriod,
  BookingStatus as DomainBookingStatus,
} from '../../domain/entities/Booking';
import { IBookingRepository } from '../interfaces/IBookingRepository';

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
    const existing = await this.prisma.booking.findUnique({
      where: { id: booking.id },
    });

    if (existing) {
      await this.updateBooking(booking);
    } else {
      await this.createBooking(booking);
    }
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

  private async createBooking(booking: Booking): Promise<void> {
    const createData: Prisma.BookingCreateInput = {
      id: booking.id,
      number: booking.number,
      user: { connect: { id: booking.userId } },
      pickupLocation: { connect: { id: booking.pickupLocationId } },
      startDate: booking.startDate,
      endDate: booking.endDate,
      status: this.mapToPrismaStatus(booking.status),
      totalAmount: booking.totalAmount.amount,
      depositAmount: booking.depositAmount.amount,
      penaltyAmount: booking.penaltyAmount.amount,
      totalHours: booking.period.getDurationInHours(),
      pricingType: 'DAILY',
      discountRate: 0,
      calculatedPrice: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await this.prisma.booking.create({ data: createData });
  }

  private async updateBooking(booking: Booking): Promise<void> {
    const updateData: Prisma.BookingUpdateInput = {
      number: booking.number,
      user: { connect: { id: booking.userId } },
      pickupLocation: { connect: { id: booking.pickupLocationId } },
      startDate: booking.startDate,
      endDate: booking.endDate,
      status: this.mapToPrismaStatus(booking.status),
      totalAmount: booking.totalAmount.amount,
      depositAmount: booking.depositAmount.amount,
      penaltyAmount: booking.penaltyAmount.amount,
      totalHours: booking.period.getDurationInHours(),
      pricingType: 'DAILY',
      discountRate: 0,
      calculatedPrice: {},
      updatedAt: new Date(),
    };

    await this.prisma.booking.update({
      where: { id: booking.id },
      data: updateData,
    });
  }

  private toDomainEntity(prismaData: import('@prisma/client').Booking): Booking {
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
      status: this.mapToDomainStatus(prismaData.status),
      penaltyAmount,
    });
  }

  private mapToPrismaStatus(domainStatus: DomainBookingStatus): PrismaBookingStatus {
    const statusMap: Record<DomainBookingStatus, PrismaBookingStatus> = {
      DRAFT: 'DRAFT',
      PENDING: 'PENDING',
      CONFIRMED: 'CONFIRMED',
      ACTIVE: 'ACTIVE',
      COMPLETED: 'COMPLETED',
      CANCELLED: 'CANCELLED',
    };

    return statusMap[domainStatus];
  }

  private mapToDomainStatus(prismaStatus: PrismaBookingStatus): DomainBookingStatus {
    const statusMap: Record<PrismaBookingStatus, DomainBookingStatus> = {
      DRAFT: 'DRAFT',
      PENDING: 'PENDING',
      CONFIRMED: 'CONFIRMED',
      ACTIVE: 'ACTIVE',
      COMPLETED: 'COMPLETED',
      CANCELLED: 'CANCELLED',
    };

    return statusMap[prismaStatus];
  }
}
