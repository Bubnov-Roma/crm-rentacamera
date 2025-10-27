import { Booking } from 'src/domain/entities/Booking';
import { PricingService } from 'src/domain/services/PricingService';
import { CreateBookingCommand } from 'src/application/commands/booking/CreateBookingCommand';
import { IBookingRepository } from 'src/application/ports/repositories/IBookingRepository';
import { IUserRepository } from 'src/application/ports/repositories/IUserRepository';
import { IEquipmentRepository } from 'src/application/ports/repositories/IEquipmentRepository';
import { RentalPeriod } from 'src/domain/value-objects/RentalPeriod';
import { Money } from 'src/domain/value-objects/Money';
import { INotificationService } from 'src/application/ports/services/INotificationService';

export class CreateBookingUseCase {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly userRepository: IUserRepository,
    private readonly equipmentRepository: IEquipmentRepository,
    private readonly pricingService: PricingService,
    private readonly notificationService: INotificationService,
  ) {}

  async execute(command: CreateBookingCommand): Promise<{ booking: Booking }> {
    // Validation
    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      throw new Error('User not found');
    }
    // Check equipment available
    for (const item of command.equipmentItems) {
      const isAvailable = await this.equipmentRepository.isAvailable(
        item.equipmentInstanceId,
        command.startDate,
        command.endDate,
      );

      if (!isAvailable) {
        throw new Error(`Equipment ${item.equipmentInstanceId} is not available`);
      }
    }
    // Create RentalPeriod value object
    const period = new RentalPeriod(command.startDate, command.endDate);
    // Cost calculating
    const totalAmount = await this.pricingService.calculateTotal({
      equipmentItems: command.equipmentItems,
      period,
      discountRate: user.discountRate || 0,
    });
    const depositAmount = new Money(totalAmount.amount * 0.3); // 30% deposit
    // Creating booking
    const booking = Booking.create({
      userId: command.userId,
      pickupLocationId: command.pickupLocationId,
      period,
      totalAmount,
      depositAmount,
    });
    // Saving
    await this.bookingRepository.save(booking);
    await this.notificationService.sendBookingConfirmation(user, booking);

    return { booking };
  }
}
