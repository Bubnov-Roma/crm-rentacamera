import { IEquipmentRepository, IUserRepository } from 'src/infrastructure/interfaces';
import { Booking } from '../../domain/entities/Booking';
import { IBookingRepository } from '../../infrastructure/interfaces/IBookingRepository';
import { PricingService } from 'src/domain/services/pricing-service';

export class CreateBookingCommand {
  constructor(
    public readonly userId: string,
    public readonly pickupLocationId: string,
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly equipmentItems: Array<{
      equipmentInstanceId: string;
      quantity: number;
    }>,
  ) {}
}

export class CreateBookingUseCase {
  constructor(
    private bookingRepository: IBookingRepository,
    private userRepository: IUserRepository,
    private equipmentRepository: IEquipmentRepository,
    private pricingService: PricingService,
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
    // Booking number generation
    const bookingNumber = `BK-${Date.now()}`;
    // Cost calculation
    const totalAmount = await this.pricingService.calculateTotal(
      command.equipmentItems,
      command.startDate,
      command.endDate,
      user.discountRate || 0,
    );

    const depositAmount = totalAmount * 0.3; // 30% deposit
    // Creating booking
    const booking = Booking.create({
      number: bookingNumber,
      userId: command.userId,
      pickupLocationId: command.pickupLocationId,
      startDate: command.startDate,
      endDate: command.endDate,
      totalAmount,
      depositAmount,
    });
    // Saving
    await this.bookingRepository.save(booking);

    return { booking };
  }
}
