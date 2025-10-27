import { TransferEquipmentCommand } from 'src/application/commands/booking/TransferEquipmentCommand';
import { IEquipmentRepository } from 'src/application/ports/repositories/IEquipmentRepository';
import { IRentalPointRepository } from 'src/application/ports/repositories/IRentalPointRepository';
import { ITransferRepository } from 'src/application/ports/repositories/ITransferRepository';
import { EquipmentTransfer } from 'src/domain/entities/Transfer';
import { INotificationService } from 'src/application/ports/services/INotificationService';
import { LogisticsService } from 'src/domain/services/LogisticsService';

export class TransferEquipmentUseCase {
  constructor(
    private readonly equipmentRepository: IEquipmentRepository,
    private readonly transferRepository: ITransferRepository,
    private readonly rentalPointRepository: IRentalPointRepository,
    private readonly logisticsService: LogisticsService,
    private readonly notificationService: INotificationService,
  ) {}

  async execute(
    command: TransferEquipmentCommand,
  ): Promise<{ success: boolean; transferId?: string; error?: string }> {
    try {
      const validationResult = await this.validateTransfer(command);
      if (!validationResult.isValid) {
        return { success: false, error: validationResult.error };
      }
      const availabilityResult = await this.checkTransferAvailability(command);
      if (!availabilityResult.isAvailable) {
        return {
          success: false,
          error: `Equipment not available for transfer: ${availabilityResult.reason}`,
        };
      }
      const estimatedArrival = await this.calculateEstimatedArrival(command);
      const transfer = EquipmentTransfer.create({
        equipmentInstanceId: command.equipmentInstanceId,
        fromLocationId: command.fromLocationId,
        toLocationId: command.toLocationId,
        scheduledDeparture: command.scheduledDeparture,
        estimatedArrival,
        transferType: this.mapReasonToTransferType(command.reason),
        associatedBookingId: command.associatedBookingId,
        notes: command.notes,
        status: 'PENDING',
      });
      await this.transferRepository.save(transfer);
      await this.sendTransferNotifications(transfer);
      return { success: true, transferId: transfer.id };
    } catch (error) {
      console.error('Error in TransferEquipmentUseCase:', error);
      return { success: false, error: 'Internal server error' };
    }
  }
  private async validateTransfer(
    command: TransferEquipmentCommand,
  ): Promise<{ isValid: boolean; error?: string }> {
    const fromLocation = await this.rentalPointRepository.findById(command.fromLocationId);
    const toLocation = await this.rentalPointRepository.findById(command.toLocationId);
    if (!fromLocation || !toLocation) {
      return { isValid: false, error: 'Invalid location specified' };
    }
    const equipment = await this.equipmentRepository.findById(command.equipmentInstanceId);
    if (!equipment) {
      return { isValid: false, error: 'Equipment not found' };
    }
    if (command.scheduledDeparture < new Date()) {
      return { isValid: false, error: 'Scheduled departure cannot be in the past' };
    }
    return { isValid: true };
  }
  private async checkTransferAvailability(
    command: TransferEquipmentCommand,
  ): Promise<{ isAvailable: boolean; reason?: string }> {
    const { equipmentInstanceId, scheduledDeparture } = command;
    const estimatedArrival = await this.calculateEstimatedArrival(command);
    const hasActiveBookings = await this.equipmentRepository.isAvailable(
      equipmentInstanceId,
      scheduledDeparture,
      estimatedArrival,
    );
    if (!hasActiveBookings) {
      return {
        isAvailable: false,
        reason: 'Equipment has active bookings during transfer period',
      };
    }
    const conflictingTransfers = await this.transferRepository.findConflictingTransfers(
      equipmentInstanceId,
      scheduledDeparture,
      estimatedArrival,
    );
    if (conflictingTransfers.length > 0) {
      return {
        isAvailable: false,
        reason: `Equipment has ${conflictingTransfers.length} conflicting transfers`,
      };
    }
    return { isAvailable: true };
  }
  private async calculateEstimatedArrival(command: TransferEquipmentCommand): Promise<Date> {
    const fromLocation = await this.rentalPointRepository.findById(command.fromLocationId);
    const toLocation = await this.rentalPointRepository.findById(command.toLocationId);
    if (!fromLocation || !toLocation) {
      throw new Error('Locations not found for arrival calculation');
    }
    const route = this.logisticsService.getRoute(fromLocation.id, toLocation.id);
    if (!route) {
      const estimatedArrival = new Date(command.scheduledDeparture);
      estimatedArrival.setDate(estimatedArrival.getDate() + 5);
      return estimatedArrival;
    }
    const estimatedArrival = new Date(command.scheduledDeparture);
    estimatedArrival.setDate(estimatedArrival.getDate() + route.standardTransitDays);
    return estimatedArrival;
  }
  private async sendTransferNotifications(transfer: EquipmentTransfer): Promise<void> {
    const equipment = await this.equipmentRepository.findById(transfer.equipmentInstanceId);
    const fromLocation = await this.rentalPointRepository.findById(transfer.fromLocationId);
    const toLocation = await this.rentalPointRepository.findById(transfer.toLocationId);
    if (equipment && fromLocation && toLocation) {
      await this.notificationService.sendTransferNotification(
        equipment,
        fromLocation,
        toLocation,
        transfer.scheduledDeparture,
        transfer.estimatedArrival,
      );
    }
  }
  private mapReasonToTransferType(
    reason: string,
  ): 'BOOKING_RELATED' | 'STOCK_BALANCE' | 'MAINTENANCE' {
    switch (reason) {
      case 'BOOKING':
        return 'BOOKING_RELATED';
      case 'STOCK':
        return 'STOCK_BALANCE';
      case 'MAINTENANCE':
        return 'MAINTENANCE';
      default:
        return 'STOCK_BALANCE';
    }
  }
}
