import { ValueNode, Kind } from 'graphql';
import { GraphQLContext } from '../context';
import { Query } from './Query';
import { Mutation } from './Mutation';

// Type resolvers for custom scalar types
const scalarResolvers = {
  DateTime: {
    serialize: (value: Date) => value.toISOString(),
    parseValue: (value: string) => new Date(value),
    parseLiteral: (ast: ValueNode): unknown => {
      if (ast.kind === Kind.STRING) {
        return new Date(ast.value);
      }
      return null;
    },
  },
  JSON: {
    serialize: (value: unknown) => value,
    parseValue: (value: unknown) => value,
    parseLiteral: (ast: ValueNode): unknown => {
      switch (ast.kind) {
        case Kind.STRING:
        case Kind.BOOLEAN:
          return ast.value;
        case Kind.INT:
        case Kind.FLOAT:
          return parseFloat(ast.value);
        case Kind.OBJECT: {
          const value: { [key: string]: unknown } = {};
          ast.fields.forEach((field) => {
            value[field.name.value] = scalarResolvers.JSON.parseLiteral(field.value);
          });
          return value;
        }
        case Kind.LIST:
          return ast.values.map(scalarResolvers.JSON.parseLiteral);
        default:
          return null;
      }
    },
  },
};

// Field resolvers for complex types
const typeResolvers = {
  Booking: {
    user: async (parent: { userId: string }, _: unknown, ctx: GraphQLContext) => {
      return ctx.loaders.user.load(parent.userId);
    },
    pickupLocation: async (
      parent: { pickupLocationId: string },
      _: unknown,
      _ctx: GraphQLContext,
    ) => {
      return { id: parent.pickupLocationId, name: 'Location', code: 'LOC', address: '' };
    },
    period: (parent: { startDate: Date; endDate: Date }) => {
      return {
        startDate: parent.startDate,
        endDate: parent.endDate,
        durationInHours: parent.endDate.getTime() - parent.startDate.getTime(),
        durationInDays:
          (parent.endDate.getTime() - parent.startDate.getTime()) / (1000 * 60 * 60 * 24),
      };
    },
  },
  Equipment: {
    category: async (parent: { categoryId: string }, _: unknown, _ctx: GraphQLContext) => {
      return { id: parent.categoryId, name: 'Category', slug: 'category' };
    },
    pricing: (
      parent: {
        baseHourlyRate?: { amount: number };
        baseDailyRate?: { amount: number };
        baseMonthlyRate?: { amount: number };
        depositAmount?: { amount: number };
      },
      _: unknown,
      _ctx: GraphQLContext,
    ) => {
      return {
        hourlyRate: parent.baseHourlyRate?.amount || 0,
        dailyRate: parent.baseDailyRate?.amount || 0,
        monthlyRate: parent.baseMonthlyRate?.amount || 0,
        depositAmount: parent.depositAmount?.amount || 0,
        currency: 'RUB',
      };
    },
    availability: async (
      _parent: { id: string },
      { _period, _locationId }: { _period: unknown; _locationId: string },
      _ctx: GraphQLContext,
    ) => {
      return {
        isAvailable: true,
        availableFrom: new Date(),
        availableUntil: new Date(),
        requiresTransfer: false,
      };
    },
  },

  User: {
    bookings: async (
      parent: { id: string },
      { _pagination }: { _pagination: unknown },
      ctx: GraphQLContext,
    ) => {
      const bookings = await ctx.bookingRepository.findByUserId(parent.id);
      return {
        edges: bookings.map((b) => ({
          node: b,
          cursor: Buffer.from(b.id).toString('base64'),
        })),
        pageInfo: { hasNextPage: false, hasPreviousPage: false },
      };
    },
  },
};

export const resolvers = {
  Query,
  Mutation,
  ...scalarResolvers,
  ...typeResolvers,
};
