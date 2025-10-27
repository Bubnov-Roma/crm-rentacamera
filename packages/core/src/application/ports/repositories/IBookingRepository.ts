import { DomainBookingStatus } from 'src/infrastructure/types/booking-types';
import { Booking } from 'src/domain/entities/Booking';

export interface IBookingRepository {
  findById(id: string): Promise<Booking | null>;
  save(booking: Booking): Promise<void>;
  findByUserId(userId: string): Promise<Booking[]>;
  updateStatus(bookingId: string, status: DomainBookingStatus): Promise<void>;
}
