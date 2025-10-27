import { Booking } from 'src/domain/entities/Booking';
import { Money } from 'src/domain/value-objects/Money';

export interface PenaltyCalculationResult {
  penaltyAmount: Money;
  penaltyReason: string;
  isPenaltyApplied: boolean;
}

export class PenaltyService {
  calculateCancellationPenalty(booking: Booking, cancellationDate: Date): PenaltyCalculationResult {
    const hoursUntilStart = booking.period.startDate.getTime() - cancellationDate.getTime();
    const hours = hoursUntilStart / (1000 * 60 * 60);

    if (hours > 40) {
      return {
        penaltyAmount: new Money(0),
        penaltyReason: 'Cancellation more than 48 hours before start',
        isPenaltyApplied: false,
      };
    }

    if (hours > 24) {
      const penaltyAmount = new Money(booking.depositAmount.amount * 0.5);
      return {
        penaltyAmount,
        penaltyReason: 'Cancellation between 24-48 hours before start - 50% penalty',
        isPenaltyApplied: true,
      };
    }

    const penaltyAmount = new Money(booking.depositAmount.amount);
    return {
      penaltyAmount,
      penaltyReason: 'Cancellation less than 24 hours before start - 100% penalty',
      isPenaltyApplied: true,
    };
  }

  calculateLateReturnPenalty(booking: Booking, actualReturnDate: Date): PenaltyCalculationResult {
    const hoursLate =
      (actualReturnDate.getTime() - booking.period.endDate.getTime()) / (1000 * 60 * 60);
    if (hoursLate <= 0) {
      return {
        penaltyAmount: new Money(0),
        penaltyReason: 'Returned on time',
        isPenaltyApplied: false,
      };
    }
    // 10%
    if (hoursLate <= 2) {
      const penaltyAmount = new Money(booking.totalAmount.amount * 0.1);
      return {
        penaltyAmount,
        penaltyReason: 'Late return up to 2 hours - 10% penalty',
        isPenaltyApplied: true,
      };
    }
    // 25%
    if (hoursLate <= 24) {
      const penaltyAmount = new Money(booking.totalAmount.amount * 0.25);
      return {
        penaltyAmount,
        penaltyReason: 'Late return up to 24 hours - 25% penalty',
        isPenaltyApplied: true,
      };
    }
    // full amount + deposit
    const penaltyAmount = new Money(booking.totalAmount.amount + booking.depositAmount.amount);
    return {
      penaltyAmount,
      penaltyReason: 'Late return more than 24 hours - full amount + deposit penalty',
      isPenaltyApplied: true,
    };
  }

  calculateNoShowPenalty(booking: Booking): PenaltyCalculationResult {
    const penaltyAmount = new Money(booking.depositAmount.amount);
    return {
      penaltyAmount,
      penaltyReason: 'No-show - 100% deposit penalty',
      isPenaltyApplied: true,
    };
  }
}
