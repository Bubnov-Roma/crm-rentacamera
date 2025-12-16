import { Booking } from 'src/domain/entities/Booking';
import { PricingService } from 'src/domain/services/PricingService';
import { CreateBookingCommand } from 'src/application/commands/booking/CreateBookingCommand';
import { IBookingRepository } from 'src/application/ports/repositories/IBookingRepository';
import { IUserRepository } from 'src/application/ports/repositories/IUserRepository';
import { IEquipmentRepository } from 'src/application/ports/repositories/IEquipmentRepository';
import { RentalPeriod } from 'src/domain/value-objects/RentalPeriod';
import { Money } from 'src/domain/value-objects/Money';
import { INotificationService } from 'src/application/ports/services/INotificationService';
import { IEventPublisher } from 'src/application/ports/events/IEventPublisher';
import { UserCanMakeBookingSpecification } from 'src/domain/specifications/UserSpecifications';
import { EquipmentIsAvailableSpecification } from 'src/domain/specifications/EquipmentSpecifications';
import { BookingCanBeCreatedSpecification } from 'src/domain/specifications/BookingSpecifications';
import { Equipment } from 'src/domain/entities/Equipment';

export class CreateBookingUseCase {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly userRepository: IUserRepository,
    private readonly equipmentRepository: IEquipmentRepository,
    private readonly pricingService: PricingService,
    private readonly notificationService: INotificationService,
    private readonly eventPublisher: IEventPublisher,
  ) {}

  async execute(command: CreateBookingCommand): Promise<{ booking: Booking }> {
    // 1. User Validation
    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      throw new Error('User not found');
    }
    const userCanBook = new UserCanMakeBookingSpecification().isSatisfiedBy(user);
    if (!userCanBook) {
      throw new Error('User cannot make booking');
    }
    // 2. Check equipment available
    const period = new RentalPeriod(command.startDate, command.endDate);
    const equipmentItems: Equipment[] = [];

    for (const item of command.equipmentItems) {
      const equipmentAvailable = await new EquipmentIsAvailableSpecification(
        this.equipmentRepository,
      ).isSatisfiedBy(item.equipmentInstanceId, period);

      if (!equipmentAvailable) {
        throw new Error(`Equipment ${item.equipmentInstanceId} is not available`);
      }

      const equipment = await this.equipmentRepository.findById(item.equipmentInstanceId);
      if (equipment) {
        equipmentItems.push(equipment);
      }
    }
    // 3. Cost calculating
    const totalAmount = await this.pricingService.calculateTotal({
      equipmentItems: command.equipmentItems,
      period,
      discountRate: user.discountRate || 0,
    });

    const depositAmount = new Money(totalAmount.amount * 0.3); // 30% deposit

    // 4. Creating booking
    const booking = Booking.create({
      userId: command.userId,
      pickupLocationId: command.pickupLocationId,
      period,
      totalAmount,
      depositAmount,
      equipmentIds: command.equipmentItems.map((item) => item.equipmentInstanceId),
    });

    // 5. Check business logic
    const canBeCreated = new BookingCanBeCreatedSpecification().isSatisfiedBy(
      booking,
      equipmentItems,
    );

    if (!canBeCreated) {
      throw new Error('Booking cannot be created due to business rules');
    }

    // 6. Saving
    await this.bookingRepository.save(booking);

    // 7. Event publication
    const domainEvents = booking.getDomainEvents();
    for (const event of domainEvents) {
      await this.eventPublisher.publish(event.payload);
    }
    booking.clearDomainEvents();

    // 8. Send notification
    await this.notificationService.sendBookingConfirmation(user, booking);

    return { booking };
  }
}
