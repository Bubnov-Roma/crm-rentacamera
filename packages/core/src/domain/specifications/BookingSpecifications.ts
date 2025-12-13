import { Booking } from '../entities/Booking';
import { Equipment } from '../entities/Equipment';

export class BookingCanBeCreatedSpecification {
  isSatisfiedBy(booking: Booking, equipment: Equipment[]): boolean {
    return (
      equipment.every((eq) => eq.isAvailableForRent()) &&
      booking.period.getDurationInHours() >= 3 &&
      booking.totalAmount.amount > 0
    );
  }
}

export class BookingCanBeCancelledSpecification {
  isSatisfiedBy(booking: Booking, cancellationDate: Date): boolean {
    const hoursUnitStart =
      (booking.period.startDate.getTime() - cancellationDate.getTime()) / (1000 * 60 * 60);
    return (booking.status === 'PENDING' || booking.status === 'CONFIRMED') && hoursUnitStart > 24;
  }
}

export class BookingCanBeExtendedSpecification {
  isSatisfiedBy(booking: Booking, newEndDate: Date): boolean {
    return booking.status === 'ACTIVE' && newEndDate > booking.period.endDate;
  }
}
