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
