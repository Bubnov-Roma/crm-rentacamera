import { CreateBookingCommand, CancelBookingCommand } from '@rentacamera/core';
import { GraphQLContext } from '../context';
import { hashPassword } from '../../lib/auth/bcrypt';
import { createTokensPair } from '@/lib/auth/jwt'; // not implemented yet

export const Mutation = {
  // ==================== AUTH ====================
  async register(
    _: unknown,
    {
      email,
      password,
      firstName,
      lastName,
    }: { email: string; password: string; firstName: string; lastName: string },
    ctx: GraphQLContext,
  ) {
    // Check if user exists
    const existingUser = await ctx.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user (simplified - use proper User.create in production)
    const user = {
      id: `user_${Date.now()}`,
      email,
      passwordHash,
      firstName,
      lastName,
      phone: '',
      role: 'CLIENT' as const,
      discountRate: 0,
      isActive: true,
      isVerified: false,
      avatar: null,
      lastLoginAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Save user
    // await ctx.userRepository.save(User.reconstitute(user));

    // Generate tokens
    const { accessToken, refreshToken } = await createTokensPair(user.id, user.email, user.role);
    return { accessToken, refreshToken, user };
  },

  async login(
    _: unknown,
    { email, _password }: { email: string; _password: string },
    ctx: GraphQLContext,
  ) {
    const user = await ctx.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // TODO: Implement password verification, add user hash is stored in user.passwordHash
    // Verify password
    // const isValid = await verifyPassword(password, user.);
    // if (!isValid) {
    //   throw new Error('Invalid credentials');
    // }

    // Generate tokens
    const { accessToken, refreshToken } = await createTokensPair(user.id, user.email, user.role);
    return { accessToken, refreshToken, user };
  },

  async refreshToken(_: unknown, __: unknown, _ctx: GraphQLContext) {
    // This should be implemented with refresh token verification
    // For now, returning error
    throw new Error('Refresh token implementation needed');
  },

  // ==================== BOOKING ====================
  async createBooking(
    _: unknown,
    {
      input,
    }: {
      input: {
        pickupLocationId: string;
        startDate: string;
        endDate: string;
        equipmentItems: { equipmentInstanceId: string; quantity: number }[];
      };
    },
    ctx: GraphQLContext,
  ) {
    if (!ctx.userId) {
      throw new Error('Unauthorized');
    }

    try {
      const command = new CreateBookingCommand(
        ctx.userId,
        input.pickupLocationId,
        new Date(input.startDate),
        new Date(input.endDate),
        input.equipmentItems,
      );

      const { booking } = await ctx.createBookingUseCase.execute(command);

      return {
        booking,
        errors: [],
        success: true,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      return {
        booking: null,
        errors: [{ message: errorMessage }],
        success: false,
      };
    }
  },

  async confirmBooking(_: unknown, { id }: { id: string }, ctx: GraphQLContext) {
    if (!ctx.userId) {
      throw new Error('Unauthorized');
    }

    try {
      await ctx.confirmBookingUseCase.execute({ bookingId: id });
      const booking = await ctx.bookingRepository.findById(id);

      return {
        booking,
        errors: [],
        success: true,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      return {
        booking: null,
        errors: [{ message: errorMessage }],
        success: false,
      };
    }
  },

  async cancelBooking(
    _: unknown,
    { id, reason }: { id: string; reason: string },
    ctx: GraphQLContext,
  ) {
    if (!ctx.userId) {
      throw new Error('Unauthorized');
    }

    try {
      const command = new CancelBookingCommand(id, reason, ctx.userId);
      await ctx.cancelBookingUseCase.execute(command);

      const booking = await ctx.bookingRepository.findById(id);

      return {
        booking,
        errors: [],
        success: true,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      return {
        booking: null,
        errors: [{ message: errorMessage }],
        success: false,
      };
    }
  },

  // ==================== CART ====================
  async addToCart(
    _: unknown,
    { _equipmentId, _quantity }: { _equipmentId: string; _quantity: number },
    _ctx: GraphQLContext,
  ) {
    // Cart is client-side only (Zustand store)
    // This mutation is not needed for server-side
    return {
      items: [],
      totalAmount: 0,
      itemCount: 0,
    };
  },

  async removeFromCart(
    _: unknown,
    { _equipmentId }: { _equipmentId: string },
    _ctx: GraphQLContext,
  ) {
    // Cart is client-side only
    return {
      items: [],
      totalAmount: 0,
      itemCount: 0,
    };
  },

  async clearCart(_: unknown, __: unknown, _ctx: GraphQLContext) {
    // Cart is client-side only
    return {
      items: [],
      totalAmount: 0,
      itemCount: 0,
    };
  },
};
