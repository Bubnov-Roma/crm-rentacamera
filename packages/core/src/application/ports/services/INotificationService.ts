import { Booking } from '../../../domain/entities/Booking';
import { Equipment } from '../../../domain/entities/Equipment';
import { RentalPoint } from '../../../domain/entities/RentalPoint';
import { User } from '../../../domain/entities/User';
import { PenaltyCalculationResult } from '../../../domain/services/PenaltyService';

export interface INotificationService {
  sendBookingConfirmation(user: User, booking: Booking): Promise<void>;
  sendBookingConfirmed(booking: Booking): Promise<void>;
  sendLaterReturnWarning(user: User, booking: Booking): Promise<void>;
  sendPenaltyNotification(
    user: User,
    booking: Booking,
    penaltyAmount: number,
    reason: string,
  ): Promise<void>;
  sendCancellationNotification(
    booking: Booking,
    penaltyResult: PenaltyCalculationResult,
    user?: User,
  ): Promise<void>;
  sendTransferNotification(
    equipment: Equipment,
    fromLocation: RentalPoint,
    toLocation: RentalPoint,
    scheduledDate: Date,
    estimatedArrival: Date,
  ): Promise<void>;
}
