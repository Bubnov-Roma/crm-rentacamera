import { GraphQLContext } from '../context';

type EquipmentListArgs = {
  filters: { categoryId: string };
  _pagination?: { first?: number; after?: string } | null;
};

export const Query = {
  // Equipment
  async equipment(_: unknown, { id }: { id: string }, ctx: GraphQLContext) {
    return ctx.loaders.equipment.load(id);
  },

  async equipmentList(
    _: unknown,
    { filters, _pagination }: EquipmentListArgs,
    ctx: GraphQLContext,
  ) {
    const equipment = await ctx.equipmentRepository.findByCategory(filters?.categoryId);

    // TODO: Implement proper pagination with cursors
    return {
      edges: equipment.map((eq: (typeof equipment)[number]) => ({
        node: eq,
        cursor: Buffer.from(eq.id).toString('base64'),
      })),
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: null,
        endCursor: null,
      },
      totalCount: equipment.length,
    };
  },

  // Booking
  async booking(_: unknown, { id }: { id: string }, ctx: GraphQLContext) {
    if (!ctx.userId) {
      throw new Error('Unauthorized');
    }

    const booking = await ctx.bookingRepository.findById(id);

    // Check ownership
    if (booking && booking.userId !== ctx.userId) {
      throw new Error('Forbidden');
    }

    return booking;
  },

  async myBookings(
    _: unknown,
    { status, _pagination }: { status: string; _pagination: unknown },
    ctx: GraphQLContext,
  ) {
    if (!ctx.userId) {
      throw new Error('Unauthorized');
    }

    const bookings = await ctx.bookingRepository.findByUserId(ctx.userId);

    // Filter by status if provided
    const filtered = status
      ? bookings.filter((b: (typeof bookings)[number]) => b.status === status)
      : bookings;

    return {
      edges: filtered.map((booking: (typeof bookings)[number]) => ({
        node: booking,
        cursor: Buffer.from(booking.id).toString('base64'),
      })),
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: null,
        endCursor: null,
      },
      totalCount: filtered.length,
    };
  },

  // Availability
  // async checkAvailability(
  //   _: unknown,
  //   {
  //     equipmentId,
  //     period,
  //     locationId,
  //   }: { equipmentId: string; period: { startDate: string; endDate: string }; locationId: string },
  //   ctx: GraphQLContext,
  // ) {
  //   const result = await ctx.availabilityService.checkEquipmentAvailability({
  //     equipmentInstanceId: equipmentId,
  //     requestedLocationId: locationId,
  //     startDate: period.startDate,
  //     endDate: period.endDate,
  //   });

  //   return {
  //     isAvailable: result.isAvailable,
  //     availableFrom: result.availableFrom,
  //     message: result.isAvailable
  //       ? 'Equipment is available'
  //       : 'Equipment is not available for the selected period',
  //   };
  // },

  // User
  async me(_: unknown, __: unknown, ctx: GraphQLContext) {
    if (!ctx.userId) {
      return null;
    }

    return ctx.loaders.user.load(ctx.userId);
  },
};
