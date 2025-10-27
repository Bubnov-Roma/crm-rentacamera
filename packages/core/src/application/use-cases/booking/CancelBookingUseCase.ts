import { CancelBookingCommand } from 'src/application/commands/booking/CancelBookingCommand';
import { IBookingRepository } from 'src/application/ports/repositories/IBookingRepository';
import { IUserRepository } from 'src/application/ports/repositories/IUserRepository';
import { INotificationService } from 'src/application/ports/services/INotificationService';
import { PenaltyService } from 'src/domain/services/PenaltyService';

export class CancelBookingUseCase {
  constructor(
    public readonly bookingRepository: IBookingRepository,
    public readonly penaltyService: PenaltyService,
    public readonly notificationService: INotificationService,
    public readonly userRepository: IUserRepository,
  ) {}

  async execute(command: CancelBookingCommand): Promise<{ penaltyAmount: number }> {
    const booking = await this.bookingRepository.findById(command.bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }
    const user = await this.userRepository.findById(booking.userId);
    if (!user) {
      throw new Error('User not found');
    }
    const penaltyResult = this.penaltyService.calculateCancellationPenalty(booking, new Date());
    if (penaltyResult.isPenaltyApplied) {
      booking.applyPenalty(penaltyResult.penaltyAmount);
    }
    booking.cancel(command.reason);
    await this.bookingRepository.save(booking);
    await this.notificationService.sendCancellationNotification(booking, penaltyResult, user);
    return {
      penaltyAmount: penaltyResult.penaltyAmount.amount,
    };
  }
}
