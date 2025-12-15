import { IEquipmentRepository } from 'src/application/ports/repositories/IEquipmentRepository';
import { LogisticsService } from './LogisticsService';
import { RentalPoint } from '../entities/RentalPoint';
import { ITransferRepository } from 'src/application/ports/repositories/ITransferRepository';
import { EquipmentTransfer } from '../entities/Transfer';
export interface AvailabilityCheckResult {
  readonly isAvailable: boolean;
  readonly availableFrom?: Date;
  readonly availableUntil?: Date;
  readonly requiresTransfer?: boolean;
  readonly transferTimeline?: {
    readonly scheduledDeparture: Date;
    readonly estimatedArrival: Date;
    readonly transitDays: number;
  };
  readonly conflictingBookings?: Array<{
    readonly bookingId: string;
    readonly startDate: Date;
    readonly endDate: Date;
  }>;
  readonly conflictingTransfers?: EquipmentTransfer[];
}

export interface EquipmentAvailabilityRequest {
  readonly equipmentInstanceId: string;
  readonly requestedLocationId: string;
  readonly startDate: Date;
  readonly endDate: Date;
  readonly quantity?: number;
}

export class AvailabilityService {
  constructor(
    private readonly equipmentRepository: IEquipmentRepository,
    private readonly transferRepository: ITransferRepository,
    private readonly logisticsService: LogisticsService,
  ) {}

  async checkEquipmentAvailability(
    request: EquipmentAvailabilityRequest,
  ): Promise<AvailabilityCheckResult> {
    const { equipmentInstanceId, startDate, endDate } = request;

    const isLocallyAvailable = await this.equipmentRepository.isAvailable(
      equipmentInstanceId,
      startDate,
      endDate,
    );

    if (isLocallyAvailable) {
      return {
        isAvailable: true,
        availableFrom: startDate,
        availableUntil: endDate,
        requiresTransfer: false,
      };
    }
    return await this.checkAvailabilityWithTransfer(request);
  }

  async checkBulkAvailability(
    requests: EquipmentAvailabilityRequest[],
  ): Promise<Map<string, AvailabilityCheckResult>> {
    const results = new Map<string, AvailabilityCheckResult>();

    for (const request of requests) {
      const result = await this.checkEquipmentAvailability(request);
      results.set(request.equipmentInstanceId, result);
    }

    return results;
  }

  async checkInterCityAvailability(
    equipmentInstanceId: string,
    fromLocation: RentalPoint,
    toLocation: RentalPoint,
    bookingStartDate: Date,
    bookingEndDate: Date,
  ): Promise<AvailabilityCheckResult> {
    const transferTimeline = this.logisticsService.calculateTransferTimeLine(
      fromLocation,
      toLocation,
      bookingStartDate,
      bookingEndDate,
    );

    if (!transferTimeline) {
      return {
        isAvailable: false,
        availableFrom: new Date(Date.now() + 24 * 60 * 60 * 1000),
      };
    }
    const isAvailableForExtendedPeriod = await this.equipmentRepository.isAvailable(
      equipmentInstanceId,
      transferTimeline.scheduledDeparture,
      transferTimeline.estimatedArrival,
    );
    const conflictingTransfers = await this.transferRepository.findConflictingTransfers(
      equipmentInstanceId,
      transferTimeline.scheduledDeparture,
      transferTimeline.estimatedArrival,
    );
    const hasConflictingTransfers = conflictingTransfers.length > 0;
    return {
      isAvailable: isAvailableForExtendedPeriod && !hasConflictingTransfers,
      availableFrom: transferTimeline.scheduledDeparture,
      availableUntil: transferTimeline.estimatedArrival,
      requiresTransfer: true,
      transferTimeline: isAvailableForExtendedPeriod
        ? {
            scheduledDeparture: transferTimeline.scheduledDeparture,
            estimatedArrival: transferTimeline.estimatedArrival,
            transitDays: transferTimeline.transitDays,
          }
        : undefined,
      conflictingTransfers: hasConflictingTransfers ? conflictingTransfers : undefined,
    };
  }

  private async checkAvailabilityWithTransfer(
    request: EquipmentAvailabilityRequest,
  ): Promise<AvailabilityCheckResult> {
    // Здесь можно добавить логику поиска оборудования в других филиалах
    // и проверки возможности трансфера

    const nextAvailableDate = await this.calculateNextAvailableDate(request.startDate);

    return {
      isAvailable: false,
      availableFrom: nextAvailableDate,
    };
  }

  private async calculateNextAvailableDate(afterDate: Date): Promise<Date> {
    // TODO: Реализовать логику расчета следующей доступной даты
    // на основе активных бронирований и трансферов

    // Временная реализация - возвращаем дату через 24 часа
    return new Date(afterDate.getTime() + 24 * 60 * 60 * 1000);
  }
}
