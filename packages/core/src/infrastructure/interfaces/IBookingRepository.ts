import { Booking } from '../../domain/entities/Booking';

export interface IBookingRepository {
  findById(id: string): Promise<Booking | null>;
  save(booking: Booking): Promise<void>;
  findByUserId(userId: string): Promise<Booking[]>;
  updateStatus(bookingId: string, status: string): Promise<void>;
}
