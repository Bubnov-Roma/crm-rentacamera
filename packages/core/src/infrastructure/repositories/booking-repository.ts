import { PrismaClient } from '@prisma/client';
import { Booking } from '../../domain/entities/Booking';
import { IBookingRepository } from '../interfaces/IBookingRepository';

export class PrismaBookingRepository implements IBookingRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<Booking | null> {
    const bookingData = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        items: true,
        payments: true,
        services: true,
      },
    });

    if (!bookingData) return null;

    return Booking.fromPrisma(bookingData);
  }

  async save(booking: Booking): Promise<void> {
    await this.prisma.booking.upsert({
      where: { id: booking.id },
      create: booking.toPrisma(),
      update: booking.toPrisma(),
    });
  }

  async findByUserId(userId: string): Promise<Booking[]> {
    const bookingData = await this.prisma.booking.findMany({
      where: { userId },
      include: {
        items: true,
        payments: true,
      },
    });
    return bookingData.map((data) => Booking.fromPrisma(data));
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
}
