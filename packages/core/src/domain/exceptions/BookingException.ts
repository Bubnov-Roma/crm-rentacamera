import { DomainException } from './DomainException';

export class BookingNotFoundException extends DomainException {
  constructor(bookingId: string) {
    super(`Booking not found: ${bookingId}`, 'BOOKING_NOT_FOUND', { bookingId });
  }
}

export class InvalidBookingStatusException extends DomainException {
  constructor(currentStatus: string, attemptedAction: string) {
    super(
      `Cannot ${attemptedAction} booking in ${currentStatus} status`,
      'INVALID_BOOKING_STATUS',
      { currentStatus, attemptedAction },
    );
  }
}
