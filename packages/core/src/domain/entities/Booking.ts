export type BookingStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'CONFIRMED'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'CANCELLED';

export interface DomainEvent {
  type: string;
  payload: Record<string, unknown>;
  timestamp: Date;
}

export class Booking {
  private domainEvents: DomainEvent[] = [];

  private constructor(
    public readonly id: string,
    public readonly number: string,
    public readonly userId: string,
    public readonly pickupLocationId: string,
    public readonly startDate: Date,
    public readonly endDate: Date,
    public status: BookingStatus,
    public readonly totalAmount: number,
    public readonly depositAmount: number,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}

  static fromPrisma(data: {
    id: string;
    number: string;
    userId: string;
    pickupLocationId: string;
    startDate: Date;
    endDate: Date;
    status: BookingStatus;
    totalAmount: number;
    depositAmount: number;
    createdAt: Date;
    updatedAt: Date;
  }): Booking {
    return new Booking(
      data.id,
      data.number,
      data.userId,
      data.pickupLocationId,
      data.startDate,
      data.endDate,
      data.status,
      data.totalAmount,
      data.depositAmount,
      data.createdAt,
      data.updatedAt,
    );
  }

  toPrisma(): Record<string, unknown> {
    return {
      id: this.id,
      number: this.number,
      userId: this.userId,
      pickupLocationId: this.pickupLocationId,
      startDate: this.startDate,
      endDate: this.endDate,
      status: this.status,
      totalAmount: this.totalAmount,
      depositAmount: this.depositAmount,
      ...(this.createdAt && { createdAt: this.createdAt }),
      ...(this.updatedAt && { updatedAt: this.updatedAt }),
    };
  }

  static create(properties: {
    id?: string;
    number: string;
    userId: string;
    pickupLocationId: string;
    startDate: Date;
    endDate: Date;
    totalAmount: number;
    depositAmount: number;
  }): Booking {
    const id = properties.id || `booking_${Date.now()}`;

    return new Booking(
      id,
      properties.number,
      properties.userId,
      properties.pickupLocationId,
      properties.startDate,
      properties.endDate,
      'PENDING',
      properties.totalAmount,
      properties.depositAmount,
    );
  }

  // Business-methods with validation

  confirm(): void {
    // Domain logic for confirm booking
    if (this.status !== 'PENDING') {
      throw new Error('Only pending bookings can be confirmed');
    }

    this.status = 'CONFIRMED';
    this.addDomainEvent({
      type: 'BOOKING_CONFIRMED',
      payload: { bookingId: this.id },
    });
  }

  cancel(reason: string): void {
    // Domain logic for cancel booking
    if (this.status === 'CANCELLED' || this.status === 'COMPLETED') {
      throw new Error(`Cannot cancel booking in ${this.status} status`);
    }

    this.status = 'CANCELLED';
    this.addDomainEvent({
      type: 'BOOKING_CANCELLED',
      payload: {
        bookingId: this.id,
        reason,
        previousStatus: this.status,
      },
    });
  }

  // For working with equipment
  calculatePenalty(cancellationDate: Date): number {
    const hoursUntilStart =
      (this.startDate.getTime() - cancellationDate.getTime()) / (1000 * 60 * 60);

    if (hoursUntilStart > 48) return 0; // more 2 days - without penalty
    if (hoursUntilStart > 24) return this.depositAmount * 0.5; // 1-2 days - 50%
    return this.depositAmount; // less 1 day - 100%
  }

  private addDomainEvent(event: Omit<DomainEvent, 'timestamp'>): void {
    this.domainEvents.push({ ...event, timestamp: new Date() });
  }

  getDomainEvents(): ReadonlyArray<DomainEvent> {
    return [...this.domainEvents];
  }

  clearDomainEvents(): void {
    this.domainEvents = [];
  }

  // Validation
  isValidForConfirmation(): boolean {
    return this.status === 'PENDING' && this.startDate > new Date() && this.totalAmount > 0;
  }

  getDurationInHours(): number {
    return Math.ceil((this.endDate.getTime() - this.startDate.getTime()) / (1000 * 60 * 60));
  }

  // Addition business-logic
  activate(): void {
    if (this.status !== 'CONFIRMED') {
      throw new Error('Only confirmed bookings can be activated');
    }
    if (this.startDate > new Date()) {
      throw new Error('Cannot activate booking before start date');
    }

    this.status = 'ACTIVE';
    this.addDomainEvent({
      type: 'BOOKING_ACTIVATED',
      payload: { bookingId: this.id },
    });
  }

  complete(): void {
    if (this.status !== 'ACTIVE') {
      throw new Error('Only active bookings can be completed');
    }

    this.status = 'COMPLETED';
    this.addDomainEvent({
      type: 'BOOKING_COMPLETED',
      payload: { bookingId: this.id },
    });
  }

  // State check methods
  isActive(): boolean {
    return this.status === 'ACTIVE';
  }

  isCompleted(): boolean {
    return this.status === 'COMPLETED';
  }

  isCancelled(): boolean {
    return this.status === 'CANCELLED';
  }

  canBeModified(): boolean {
    return this.status === 'DRAFT' || this.status === 'PENDING';
  }
}
