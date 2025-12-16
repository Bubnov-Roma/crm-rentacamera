// import { CreateBookingCommand, CancelBookingCommand } from '@rentacamera/core';
// import { GraphQLContext } from '../context';
// import bcrypt from 'bcryptjs';
// import { signAccessToken, signRefreshToken } from '@/lib/auth/jwt';

// export const Mutation = {
//   // Auth
//   async register(
//     _: unknown,
//     {
//       email,
//       password,
//       firstName,
//       lastName,
//     }: { email: string; password: string; firstName: string; lastName: string },
//     ctx: GraphQLContext,
//   ) {
//     // Check if user exists
//     const existingUser = await ctx.userRepository.findByEmail(email);
//     if (existingUser) {
//       throw new Error('User already exists');
//     }

//     // Hash password
//     const passwordHash = await bcrypt.hash(password, 10);

//     // Create user (simplified - use proper User.create in production)
//     const user = {
//       id: `user_${Date.now()}`,
//       email,
//       passwordHash,
//       firstName,
//       lastName,
//       phone: '',
//       role: 'CLIENT' as const,
//       discountRate: 0,
//       isActive: true,
//       isVerified: false,
//       avatar: null,
//       lastLoginAt: null,
//       createdAt: new Date(),
//       updatedAt: new Date(),
//     };

//     // Save user
//     // await ctx.userRepository.save(User.reconstitute(user));

//     // Generate tokens
//     const sessionId = crypto.randomUUID();
//     const accessToken = await signAccessToken({
//       userId: user.id,
//       email: user.email,
//       role: user.role,
//       sessionId,
//     });
//     const refreshToken = await signRefreshToken(user.id, sessionId);

//     return { accessToken, refreshToken, user };
//   },

//   async login(
//     _: unknown,
//     { email, _password }: { email: string; _password: string },
//     ctx: GraphQLContext,
//   ) {
//     const user = await ctx.userRepository.findByEmail(email);
//     if (!user) {
//       throw new Error('Invalid credentials');
//     }

//     // Verify password
//     // const isValid = await bcrypt.compare(password, user.passwordHash);
//     // if (!isValid) {
//     //   throw new Error('Invalid credentials');
//     // }

//     // Generate tokens
//     const sessionId = crypto.randomUUID();
//     const accessToken = await signAccessToken({
//       userId: user.id,
//       email: user.email,
//       role: user.role,
//       sessionId,
//     });
//     const refreshToken = await signRefreshToken(user.id, sessionId);

//     return { accessToken, refreshToken, user };
//   },

//   // Booking
//   async createBooking(
//     _: unknown,
//     {
//       input,
//     }: {
//       input: {
//         pickupLocationId: string;
//         startDate: string;
//         endDate: string;
//         equipmentItems: { equipmentInstanceId: string; quantity: number }[];
//       };
//     },
//     ctx: GraphQLContext,
//   ) {
//     if (!ctx.userId) {
//       throw new Error('Unauthorized');
//     }

//     try {
//       const command = new CreateBookingCommand(
//         ctx.userId,
//         input.pickupLocationId,
//         new Date(input.startDate),
//         new Date(input.endDate),
//         input.equipmentItems,
//       );

//       const { booking } = await ctx.createBookingUseCase.execute(command);

//       return {
//         booking,
//         errors: [],
//         success: true,
//       };
//     } catch (error) {
//       const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
//       return {
//         booking: null,
//         errors: [{ message: errorMessage }],
//         success: false,
//       };
//     }
//   },

//   async cancelBooking(
//     _: unknown,
//     { id, reason }: { id: string; reason: string },
//     ctx: GraphQLContext,
//   ) {
//     if (!ctx.userId) {
//       throw new Error('Unauthorized');
//     }

//     try {
//       const command = new CancelBookingCommand(id, reason, ctx.userId);
//       await ctx.cancelBookingUseCase.execute(command);

//       const booking = await ctx.bookingRepository.findById(id);

//       return {
//         booking,
//         errors: [],
//         success: true,
//       };
//     } catch (error) {
//       const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
//       return {
//         booking: null,
//         errors: [{ message: errorMessage }],
//         success: false,
//       };
//     }
//   },
// };
