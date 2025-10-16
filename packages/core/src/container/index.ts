import { createContainer, asClass, InjectionMode, asValue } from 'awilix';

// Repositories
import { PrismaBookingRepository } from '../infrastructure/repositories/booking-repository';
import { PrismaUserRepository } from '../infrastructure/repositories/user-repository';
// import { PrismaEquipmentRepository } from '../infrastructure/repositories/equipment-repository';
// import { PrismaRentalPointRepository } from '../infrastructure/repositories/rental-point-repository';

// Use Cases
import { CreateBookingUseCase } from '../application/use-cases/create-booking-use-case';
// import { ConfirmBookingUseCase } from '../application/use-cases/confirm-booking-use-case';
// import { CancelBookingUseCase } from '../application/use-cases/cancel-booking-use-case';
// import { TransferEquipmentUseCase } from '../application/use-cases/transfer-equipment-use-case';

// Services
import { PricingService } from '../domain/services/pricing-service';
// import { NotificationService } from '../infrastructure/services/notification-service';
import { createPrismaClient } from './container';

export const configureContainer = () => {
  const container = createContainer({
    injectionMode: InjectionMode.PROXY,
  });

  // Database
  container.register({
    prisma: asValue(createPrismaClient()),
  });

  // Repositories
  container.register({
    bookingRepository: asClass(PrismaBookingRepository).singleton(),
    userRepository: asClass(PrismaUserRepository).singleton(),
    // equipmentRepository: asClass(PrismaEquipmentRepository).singleton(),
    // rentalPointRepository: asClass(PrismaRentalPointRepository).singleton(),
  });

  // Use Cases
  container.register({
    createBookingUseCase: asClass(CreateBookingUseCase),
    // confirmBookingUseCase: asClass(ConfirmBookingUseCase),
    // cancelBookingUseCase: asClass(CancelBookingUseCase),
    // transferEquipmentUseCase: asClass(TransferEquipmentUseCase),
  });

  // Services
  container.register({
    pricingService: asClass(PricingService).singleton(),
    // notificationService: asClass(NotificationService).singleton(),
  });

  return container;
};

export type ContainerType = ReturnType<typeof configureContainer>;

// If you prefer manual instantiation without Awilix, you can do it like this:

// const prisma = createPrismaClient();
// const bookingRepository = new PrismaBookingRepository(prisma);
// const userRepository = new PrismaUserRepository(prisma);
// const equipmentRepository = new PrismaEquipmentRepository(prisma);
// const rentalPointRepository = new PrismaRentalPointRepository(prisma);
// const pricingService = new PricingService();
// const notificationService = new NotificationService();
// const createBookingUseCase = new CreateBookingUseCase(bookingRepository, userRepository, equipmentRepository, rentalPointRepository, pricingService, notificationService);
// const confirmBookingUseCase = new ConfirmBookingUseCase(bookingRepository, notificationService);
// const cancelBookingUseCase = new CancelBookingUseCase(bookingRepository, notificationService);
// const transferEquipmentUseCase = new TransferEquipmentUseCase(equipmentRepository, rentalPointRepository, notificationService);
// return {
//   prisma,
//   bookingRepository,
//   userRepository,
//   equipmentRepository,
//   rentalPointRepository,
//   pricingService,
//   notificationService,
//   createBookingUseCase,
//   confirmBookingUseCase,
//   cancelBookingUseCase,
//   transferEquipmentUseCase,
// };
