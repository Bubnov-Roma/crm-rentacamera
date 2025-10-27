export type PrismaBookingType = {
  id: string;
  number: string;
  userId: string;
  pickupLocationId: string;
  startDate: Date;
  endDate: Date;
  status: string;
  totalAmount: number;
  depositAmount: number;
  penaltyAmount: number | null;
  totalHours: number | null;
  pricingType: string | null;
  discountRate: number | null;
  calculatedPrice: unknown | null;
  parentBookingId: string | null;
  createdAt: Date;
  updatedAt: Date;
  items?: unknown[];
  payments?: unknown[];
  services?: unknown[];
};

export type PrismaBookingCreate = Omit<
  PrismaBookingType,
  'id' | 'createdAt' | 'updatedAt' | 'items' | 'payments' | 'services'
> & {
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type SafePrismaBookingUpdate = Omit<PrismaBookingCreate, 'id'>;

export type DomainBookingStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'CONFIRMED'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'CANCELLED';

export type PrismaBookingStatus = DomainBookingStatus;

export class StatusMapper {
  static toDomain(status: string): DomainBookingStatus {
    const validStatuses: DomainBookingStatus[] = [
      'DRAFT',
      'PENDING',
      'CONFIRMED',
      'ACTIVE',
      'COMPLETED',
      'CANCELLED',
    ];

    if (!validStatuses.includes(status as DomainBookingStatus)) {
      throw new Error(`Invalid booking status: ${status}`);
    }

    return status as DomainBookingStatus;
  }

  static toPrisma(status: DomainBookingStatus): PrismaBookingStatus {
    return status;
  }
}
