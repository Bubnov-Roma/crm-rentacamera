import { PrismaClient } from '@prisma/client';

// Ports
import { IBookingRepository } from '../../application/ports/repositories/IBookingRepository';
import { IUserRepository } from '../../application/ports/repositories/IUserRepository';
import { IEquipmentRepository } from '../../application/ports/repositories/IEquipmentRepository';
import { ITransferRepository } from '../../application/ports/repositories/ITransferRepository';
import { IRentalPointRepository } from '../../application/ports/repositories/IRentalPointRepository';
import { IEventPublisher } from '../../application/ports/events/IEventPublisher';
// Repositories
import { PrismaBookingRepository } from '../../infrastructure/repositories/PrismaBookingRepository';
import { PrismaUserRepository } from '../../infrastructure/repositories/PrismaUserRepository';
import { PrismaEquipmentRepository } from '../../infrastructure/repositories/PrismaEquipmentRepository';
import { PrismaTransferRepository } from '../../infrastructure/repositories/PrismaTransferRepository';
import { PrismaRentalPointRepository } from '../../infrastructure/repositories/PrismaRentalPointRepository';
// Use Cases
import { CreateBookingUseCase } from '../../application/use-cases/booking/CreateBookingUseCase';
import { ConfirmBookingUseCase } from '../../application/use-cases/booking/ConfirmBookingUseCase';
import { CancelBookingUseCase } from '../../application/use-cases/booking/CancelBookingUseCase';
import { TransferEquipmentUseCase } from '../../application/use-cases/booking/TransferEquipmentUseCase';
// Domain Services
import { PricingService } from '../../domain/services/PricingService';
import { AvailabilityService } from '../../domain/services/AvailabilityService';
import { PenaltyService } from '../../domain/services/PenaltyService';
import { LogisticsService } from '../../domain/services/LogisticsService';
// Infrastructure Services
import { NotificationService } from '../../infrastructure/services/notification/NotificationService';
import { INotificationService } from '../../application/ports/services/INotificationService';
import { SimpleEventPublisher } from '../events/SimpleEventPublisher';
import { BookingEventHandler } from '../../application/event-handlers/BookingEventHandler';
// Events
import {
  BookingCreatedEvent,
  BookingConfirmedEvent,
  BookingCancelledEvent,
  BookingCompletedEvent,
  BookingActivatedEvent,
} from '../../domain/events/BookingEvents';
// Config
import { notificationConfig } from './notification.config';
interface ContainerDependencies {
  // Database
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
  // Services - Infrastructure Layer
  notificationService: INotificationService;
  eventPublisher: IEventPublisher;
  // Event Handlers
  bookingEventHandler: BookingEventHandler;
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

  private static initializeEventHandlers(): void {
    const eventPublisher = this.instances.eventPublisher as SimpleEventPublisher;
    const bookingEventHandler = this.instances.bookingEventHandler as BookingEventHandler;

    eventPublisher.subscribe(BookingCreatedEvent.name, (event: BookingCreatedEvent) =>
      bookingEventHandler.handleBookingCreated(event),
    );

    eventPublisher.subscribe(BookingConfirmedEvent.name, (event: BookingConfirmedEvent) =>
      bookingEventHandler.handleBookingConfirmed(event),
    );

    eventPublisher.subscribe(BookingCancelledEvent.name, (event: BookingCancelledEvent) =>
      bookingEventHandler.handleBookingCancelled(event),
    );

    eventPublisher.subscribe(BookingCompletedEvent.name, (event: BookingCompletedEvent) =>
      bookingEventHandler.handleBookingCompleted(event),
    );

    eventPublisher.subscribe(BookingActivatedEvent.name, (event: BookingActivatedEvent) =>
      bookingEventHandler.handleBookingActivated(event),
    );
  }

  static initialize(): void {
    if (this.initialized) {
      return;
    }

    console.log('🔄 Container initialize...');

    // Database
    const prisma = new PrismaClient();
    this.instances.prisma = prisma;
    console.log('✅ Prisma Client initialize');

    // Repositories
    this.instances.bookingRepository = new PrismaBookingRepository(prisma);
    this.instances.userRepository = new PrismaUserRepository(prisma);
    this.instances.equipmentRepository = new PrismaEquipmentRepository(prisma);
    this.instances.transferRepository = new PrismaTransferRepository(prisma);
    this.instances.rentalPointRepository = new PrismaRentalPointRepository(prisma);
    console.log('✅ Repositories initialize');

    // Domain Services
    this.instances.pricingService = new PricingService();
    this.instances.availabilityService = new AvailabilityService(
      this.get('equipmentRepository'),
      this.get('transferRepository'),
      this.get('logisticService'),
    );
    this.instances.penaltyService = new PenaltyService();
    this.instances.logisticService = new LogisticsService();
    console.log('✅ Domain Services initialized');

    // INFRASTRUCTURE SERVICES
    this.instances.notificationService = new NotificationService(notificationConfig);
    this.instances.eventPublisher = new SimpleEventPublisher();
    console.log('✅ Infrastructure Services initialized');

    // EVENT HANDLERS
    this.instances.bookingEventHandler = new BookingEventHandler(
      this.instances.notificationService,
      this.instances.userRepository,
      this.instances.bookingRepository,
    );
    console.log('✅ Event handlers created');

    //  AvailabilityService initialize
    this.instances.availabilityService = new AvailabilityService(
      this.instances.equipmentRepository,
      this.instances.transferRepository,
      this.instances.logisticService,
    );
    console.log('✅ AvailabilityService initialized');

    // Use Cases
    this.instances.createBookingUseCase = new CreateBookingUseCase(
      this.instances.bookingRepository,
      this.instances.userRepository,
      this.instances.equipmentRepository,
      this.instances.pricingService,
      this.instances.notificationService,
      this.instances.eventPublisher,
    );

    this.instances.confirmBookingUseCase = new ConfirmBookingUseCase(
      this.instances.bookingRepository,
      this.instances.notificationService,
      this.instances.eventPublisher,
    );

    this.instances.cancelBookingUseCase = new CancelBookingUseCase(
      this.instances.bookingRepository,
      this.instances.penaltyService,
      this.instances.notificationService,
      this.instances.userRepository,
      this.instances.eventPublisher,
    );

    this.instances.transferEquipmentUseCase = new TransferEquipmentUseCase(
      this.instances.equipmentRepository,
      this.instances.transferRepository,
      this.instances.rentalPointRepository,
      this.instances.logisticService,
      this.instances.notificationService,
    );
    console.log('✅ Use Cases initialize');

    // Set event handlers
    this.initializeEventHandlers();
    console.log('✅ Event handlers initialize');

    this.initialized = true;
    console.log('🎉 Container initialize successful!');
  }

  // AUXILIARY METHOD FOR OBTAINING DEPENDENCIES
  private static get<K extends DependencyKey>(key: K): ContainerDependencies[K] {
    if (!this.initialized) {
      this.initialize();
    }

    const instance = this.instances[key];
    if (!instance) {
      throw new Error(`Dependency "${key}" not found. Container not properly initialized.`);
    }
    return instance;
  }

  // 📦 Getters
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

  static getAvailabilityService(): AvailabilityService {
    return this.get('availabilityService');
  }

  static getNotificationService(): INotificationService {
    return this.get('notificationService');
  }

  static getEventPublisher(): IEventPublisher {
    return this.get('eventPublisher');
  }

  static getCreateBookingUseCase(): CreateBookingUseCase {
    return this.get('createBookingUseCase');
  }

  static getConfirmBookingUseCase(): ConfirmBookingUseCase {
    return this.get('confirmBookingUseCase');
  }

  static getCancelBookingUseCase(): CancelBookingUseCase {
    return this.get('cancelBookingUseCase');
  }

  static getTransferEquipmentUseCase(): TransferEquipmentUseCase {
    return this.get('transferEquipmentUseCase');
  }

  // 🧹 PRUNE
  static async dispose(): Promise<void> {
    console.log('🧹 Container cleaning...');

    const prisma = this.instances.prisma;
    if (prisma) {
      await prisma.$disconnect();
      console.log('✅ Prisma Client cleaning done');
    }
    this.instances = {};
    this.initialized = false;
    console.log('✅ Container cleaning done');
  }

  // 🎯 Modules
  static initializeAdminModule(): void {
    this.initialize();
    console.log('👔 Admin module initialized');
    // TODO - Add specific admin services
  }

  static initializeClientModule(): void {
    this.initialize();
    console.log('👤 Client module initialized');
    // TODO - Add specific client services
  }

  static initializePartnerModule(): void {
    this.initialize();
    console.log('🤝 Affiliate module initialized');
    // TODO - Add specific affiliate services
  }
}
