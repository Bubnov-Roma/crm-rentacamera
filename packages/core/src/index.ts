/* DOMAIN LAYER */

// Entities
export { Booking } from './domain/entities/Booking';
export { User } from './domain/entities/User';
export { Equipment } from './domain/entities/Equipment';
export { RentalPoint } from './domain/entities/RentalPoint';

// Value Objects
export { Money } from './domain/value-objects/Money';
export { RentalPeriod } from './domain/value-objects/RentalPeriod';
export { RecipientFactory } from './domain/value-objects/NotificationRecipient';
export type { NotificationRecipient } from './domain/value-objects/NotificationRecipient';

// Domain Services
export { PricingService } from './domain/services/PricingService';
export { AvailabilityService } from './domain/services/AvailabilityService';
export { PenaltyService } from './domain/services/PenaltyService';
export { LogisticsService } from './domain/services/LogisticsService';

// Domain Interfaces
export type { INotificationService } from './application/ports/services/INotificationService';

/*  APPLICATION LAYER  */

// Use Cases
export { CreateBookingUseCase } from './application/use-cases/booking/CreateBookingUseCase';
export { ConfirmBookingUseCase } from './application/use-cases/booking/ConfirmBookingUseCase';
export { CancelBookingUseCase } from './application/use-cases/booking/CancelBookingUseCase';
export { TransferEquipmentUseCase } from './application/use-cases/booking/TransferEquipmentUseCase';

// Commands
export { CreateBookingCommand } from './application/commands/booking/CreateBookingCommand';
export { ConfirmBookingCommand } from './application/commands/booking/ConfirmBookingCommand';
export { CancelBookingCommand } from './application/commands/booking/CancelBookingCommand';
export { TransferEquipmentCommand } from './application/commands/booking/TransferEquipmentCommand';

// Ports (Interfaces)
export type { IBookingRepository } from './application/ports/repositories/IBookingRepository';
export type { IUserRepository } from './application/ports/repositories/IUserRepository';
export type { IEquipmentRepository } from './application/ports/repositories/IEquipmentRepository';
export type { IRentalPointRepository } from './application/ports/repositories/IRentalPointRepository';

/* INFRASTRUCTURE LAYER */

// Configuration
export { Container } from './infrastructure/configs/Container';

// Repositories
export { PrismaBookingRepository } from './infrastructure/repositories/PrismaBookingRepository';
export { PrismaUserRepository } from './infrastructure/repositories/PrismaUserRepository';
export { PrismaEquipmentRepository } from './infrastructure/repositories/PrismaEquipmentRepository';

// Services
export { NotificationService } from './infrastructure/services/notification/NotificationService';

// Factories
export { WebPushProviderFactory } from './infrastructure/services/notification/providers/push/web-push/WebPushProviderFactory';

/* TYPES */

export type { DomainBookingStatus } from './infrastructure/types/booking-types';
export type {
  NotificationConfig,
  NotificationMessage,
} from './infrastructure/types/notification-service-types';
