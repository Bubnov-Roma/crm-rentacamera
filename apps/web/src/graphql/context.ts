import { Container } from '@rentacamera/core';
// import { verifyAccessToken } from '@/lib/auth/jwt';
import { createDataLoaders } from './dataloaders';

export interface GraphQLContext {
  // Repositories
  bookingRepository: ReturnType<typeof Container.getBookingRepository>;
  userRepository: ReturnType<typeof Container.getUserRepository>;
  equipmentRepository: ReturnType<typeof Container.getEquipmentRepository>;

  // Services
  pricingService: ReturnType<typeof Container.getPricingService>;
  // availabilityService: ReturnType<typeof Container.getAvailabilityService>;

  // Use Cases
  createBookingUseCase: ReturnType<typeof Container.getCreateBookingUseCase>;
  cancelBookingUseCase: ReturnType<typeof Container.getCancelBookingUseCase>;

  // Auth
  userId?: string;
  userRole?: string;

  // DataLoaders
  loaders: ReturnType<typeof createDataLoaders>;
}

export async function createContext({ request }: { request: Request }): Promise<GraphQLContext> {
  // Initialize DI Container
  Container.initialize();

  // Extract token from Authorization header
  const authHeader = request.headers.get('Authorization');
  let userId: string | undefined;
  let userRole: string | undefined;

  if (authHeader?.startsWith('Bearer ')) {
    const _token = authHeader.substring(7);
    // try {
    //   const payload = await verifyAccessToken(token);
    //   userId = payload.userId;
    //   userRole = payload.role;
    // } catch (error) {
    //   // Invalid token, continue as unauthenticated
    //   console.warn('Invalid token:', error);
    // }
  }

  return {
    // Repositories
    bookingRepository: Container.getBookingRepository(),
    userRepository: Container.getUserRepository(),
    equipmentRepository: Container.getEquipmentRepository(),

    // Services
    pricingService: Container.getPricingService(),
    // availabilityService: Container.getAvailabilityService(),

    // Use Cases
    createBookingUseCase: Container.getCreateBookingUseCase(),
    cancelBookingUseCase: Container.getCancelBookingUseCase(),

    // Auth
    userId,
    userRole,

    // DataLoaders (prevents N+1 queries)
    loaders: createDataLoaders(),
  };
}
