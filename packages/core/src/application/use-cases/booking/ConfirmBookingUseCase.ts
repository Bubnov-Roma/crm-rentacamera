import { ConfirmBookingCommand } from 'src/application/commands/booking/ConfirmBookingCommand';
import { IBookingRepository } from 'src/application/ports/repositories/IBookingRepository';
import { INotificationService } from 'src/application/ports/services/INotificationService';

export class ConfirmBookingUseCase {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly notificationService: INotificationService,
  ) {}

  async execute(command: ConfirmBookingCommand): Promise<void> {
    const booking = await this.bookingRepository.findById(command.bookingId);

    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.status !== 'PENDING') {
      throw new Error('Only pending bookings can be confirmed');
    }

    booking.confirm();

    await this.bookingRepository.save(booking);
    await this.notificationService.sendBookingConfirmed(booking);
  }
}
