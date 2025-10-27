import { PrismaClient } from '@prisma/client';

// Ports
import { IBookingRepository } from 'src/application/ports/repositories/IBookingRepository';
import { IUserRepository } from 'src/application/ports/repositories/IUserRepository';
import { IEquipmentRepository } from 'src/application/ports/repositories/IEquipmentRepository';
import { ITransferRepository } from 'src/application/ports/repositories/ITransferRepository';
import { IRentalPointRepository } from 'src/application/ports/repositories/IRentalPointRepository';
// Repositories
import { PrismaBookingRepository } from 'src/infrastructure/repositories/PrismaBookingRepository';
import { PrismaUserRepository } from 'src/infrastructure/repositories/PrismaUserRepository';
import { PrismaEquipmentRepository } from 'src/infrastructure/repositories/PrismaEquipmentRepository';
// Use Cases
import { CreateBookingUseCase } from 'src/application/use-cases/booking/CreateBookingUseCase';
import { ConfirmBookingUseCase } from 'src/application/use-cases/booking/ConfirmBookingUseCase';
import { CancelBookingUseCase } from 'src/application/use-cases/booking/CancelBookingUseCase';
import { TransferEquipmentUseCase } from 'src/application/use-cases/booking/TransferEquipmentUseCase';
// Domain Services
import { PricingService } from 'src/domain/services/PricingService';
import { AvailabilityService } from 'src/domain/services/AvailabilityService';
import { PenaltyService } from 'src/domain/services/PenaltyService';
import { LogisticsService } from 'src/domain/services/LogisticsService';
// Infrastructure Services
import { NotificationService } from 'src/infrastructure/services/NotificationService';
import { INotificationService } from 'src/application/ports/services/INotificationService';
import { notificationConfig } from './notification.config';
interface ContainerDependencies {
  prisma: PrismaClient;
  // Repositories - infrastructure layer
  bookingRepository: IBookingRepository;
  userRepository: IUserRepository;
  equipmentRepository: IEquipmentRepository;
  transferRepository: ITransferRepository;
  rentalPointRepository: IRentalPointRepository;
  // Services - Domain Layer
  pricingService: PricingService;
  availabilityService: AvailabilityService;
  penaltyService: PenaltyService;
  logisticService: LogisticsService;
  notificationService: INotificationService;
  // Use Cases - Application Layer
  createBookingUseCase: CreateBookingUseCase;
  confirmBookingUseCase: ConfirmBookingUseCase;
  cancelBookingUseCase: CancelBookingUseCase;
  transferEquipmentUseCase: TransferEquipmentUseCase;
}

type DependencyKey = keyof ContainerDependencies;

export class Container {
  private static instances: Partial<ContainerDependencies> = {};
  private static initialized = false;

  static initialize(): void {
    if (this.initialized) return;

    // Database
    const prisma = new PrismaClient();
    this.instances.prisma = prisma;

    // Repositories
    this.instances.bookingRepository = new PrismaBookingRepository(prisma);
    this.instances.userRepository = new PrismaUserRepository(prisma);
    this.instances.equipmentRepository = new PrismaEquipmentRepository(prisma);

    // Domain Services
    this.instances.pricingService = new PricingService();
    this.instances.availabilityService = new AvailabilityService(
      this.get('equipmentRepository'),
      this.get('transferRepository'),
      this.get('logisticService'),
    );
    this.instances.penaltyService = new PenaltyService();
    this.instances.notificationService = new NotificationService(notificationConfig);
    this.instances.logisticService = new LogisticsService();

    // Use Cases
    this.instances.createBookingUseCase = new CreateBookingUseCase(
      this.get('bookingRepository'),
      this.get('userRepository'),
      this.get('equipmentRepository'),
      this.get('pricingService'),
      this.get('notificationService'),
    );
    this.instances.confirmBookingUseCase = new ConfirmBookingUseCase(
      this.get('bookingRepository'),
      this.get('notificationService'),
    );
    this.instances.cancelBookingUseCase = new CancelBookingUseCase(
      this.get('bookingRepository'),
      this.get('penaltyService'),
      this.get('notificationService'),
      this.get('userRepository'),
    );
    this.instances.transferEquipmentUseCase = new TransferEquipmentUseCase(
      this.get('equipmentRepository'),
      this.get('transferRepository'),
      this.get('rentalPointRepository'),
      this.get('logisticService'),
      this.get('notificationService'),
    );
    this.initialized = true;
  }

  // Getters
  static getPrisma(): PrismaClient {
    return this.get('prisma');
  }

  static getBookingRepository(): IBookingRepository {
    return this.get('bookingRepository');
  }

  static getUserRepository(): IUserRepository {
    return this.get('userRepository');
  }

  static getEquipmentRepository(): IEquipmentRepository {
    return this.get('equipmentRepository');
  }

  static getPricingService(): PricingService {
    return this.get('pricingService');
  }

  static getCreateBookingUseCase(): CreateBookingUseCase {
    return this.get('createBookingUseCase');
  }

  static getConfirmBookingUseCase(): ConfirmBookingUseCase {
    return this.get('confirmBookingUseCase');
  }

  // Private methods
  private static get<K extends DependencyKey>(key: K): ContainerDependencies[K] {
    const instance = this.instances[key];
    if (!instance) {
      throw new Error(`Dependency ${key} not found. Did you call initialize()?`);
    }
    return instance;
  }

  static async dispose(): Promise<void> {
    const prisma = this.instances.prisma;
    if (prisma) {
      await prisma.$disconnect();
    }
    this.instances = {};
    this.initialized = false;
  }

  // Modules
  static initializeAdminModule(): void {
    this.initialize();
    // TODO - Add specific admin services
  }

  static initializeClientModule(): void {
    this.initialize();
    // TODO - Add specific client services
  }
}
