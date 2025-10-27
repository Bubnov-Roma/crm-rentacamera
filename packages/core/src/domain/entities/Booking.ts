import { DomainBookingStatus } from 'src/infrastructure/types/booking-types';
import { RentalPeriod } from '../value-objects/RentalPeriod';
import { Money } from '../value-objects/Money';

export interface DomainEvent {
  type: string;
  payload: Record<string, unknown>;
  timestamp: Date;
}
export interface BookingData {
  id: string;
  number: string;
  userId: string;
  pickupLocationId: string;
  period: RentalPeriod;
  totalAmount: Money;
  depositAmount: Money;
  status: DomainBookingStatus;
  penaltyAmount?: Money;
}

export class Booking {
  private domainEvents: DomainEvent[] = [];
  private _status: DomainBookingStatus;

  constructor(private data: BookingData) {
    this._status = data.status;

    if (data.totalAmount.amount < 0) {
      throw new Error('Total amount cannot be negative');
    }
    if (data.depositAmount.amount < 0) {
      throw new Error('Deposit amount cannot be negative');
    }
  }

  /* Fabric method for creating New booking */
  static create(params: Omit<BookingData, 'id' | 'number' | 'status'>): Booking {
    const id = `booking_${Date.now()}`;
    const number = `BK-${Date.now()}`;
    return new Booking({
      ...params,
      id,
      number,
      status: 'PENDING',
    });
  }
  // Restore from db
  static reconstitute(data: BookingData): Booking {
    return new Booking(data);
  }
  // Business-methods with validation
  confirm(): void {
    // Domain logic for confirm booking
    if (this._status !== 'PENDING') {
      throw new Error('Only pending bookings can be confirmed');
    }
    this._status = 'CONFIRMED';
    this.addDomainEvent('BOOKING_CONFIRMED', { bookingId: this.data.id });
  }
  cancel(reason: string): void {
    // Domain logic for cancel booking
    if (this._status === 'CANCELLED' || this._status === 'COMPLETED') {
      throw new Error(`Cannot cancel booking in ${this._status} status`);
    }
    this._status = 'CANCELLED';
    this.addDomainEvent('BOOKING_CANCELLED', {
      bookingId: this.data.id,
      reason,
      previousStatus: this.penaltyAmount.amount,
    });
  }
  // For working with equipment
  calculatePenalty(cancellationDate: Date): Money {
    const hoursUntilStart = this.data.period.startDate.getTime() - cancellationDate.getTime();
    const hours = hoursUntilStart / (1000 * 60 * 60);

    if (hours > 48) return new Money(0); // more 2 days - without penalty
    if (hours > 24) return new Money(this.depositAmount.amount * 0.5); // 1-2 days - 50%
    return new Money(this.depositAmount.amount); // less 1 day - 100%
  }
  applyPenalty(penalty: Money): void {
    this.data.penaltyAmount = penalty;
    this.addDomainEvent('PENALTY_APPLIED', {
      bookingId: this.data.id,
      penaltyAmount: penalty.amount,
    });
  }
  // Getters (encapsulation)
  get id(): string {
    return this.data.id;
  }
  get number(): string {
    return this.data.number;
  }
  get userId(): string {
    return this.data.userId;
  }
  get pickupLocationId(): string {
    return this.data.pickupLocationId;
  }
  get period(): RentalPeriod {
    return this.data.period;
  }
  get totalAmount(): Money {
    return this.data.totalAmount;
  }
  get depositAmount(): Money {
    return this.data.depositAmount;
  }
  get penaltyAmount(): Money {
    return this.data.penaltyAmount || new Money(0);
  }
  get status(): DomainBookingStatus {
    return this._status;
  }
  get startDate(): Date {
    return this.data.period.startDate;
  }
  get endDate(): Date {
    return this.data.period.endDate;
  }
  // Validation
  isValidForConfirmation(): boolean {
    return (
      this._status === 'PENDING' &&
      this.data.period.startDate > new Date() &&
      this.totalAmount.amount > 0
    );
  }
  canBeModified(): boolean {
    return this._status === 'DRAFT' || this._status === 'PENDING';
  }
  getDurationInHours(): number {
    return Math.ceil((this.endDate.getTime() - this.startDate.getTime()) / (1000 * 60 * 60));
  }
  // Domain Events
  private addDomainEvent(type: string, payload: Record<string, unknown>): void {
    this.domainEvents.push({ type, payload, timestamp: new Date() });
  }
  getDomainEvents(): ReadonlyArray<DomainEvent> {
    return [...this.domainEvents];
  }
  clearDomainEvents(): void {
    this.domainEvents = [];
  }
  // Addition business-logic
  activate(): void {
    if (this.status !== 'CONFIRMED') {
      throw new Error('Only confirmed bookings can be activated');
    }
    if (this.startDate > new Date()) {
      throw new Error('Cannot activate booking before start date');
    }

    this._status = 'ACTIVE';
    this.addDomainEvent('BOOKING_ACTIVATED', { bookingId: this.data.id });
  }
  complete(): void {
    if (this.status !== 'ACTIVE') {
      throw new Error('Only active bookings can be completed');
    }

    this._status = 'COMPLETED';
    this.addDomainEvent('BOOKING_COMPLETED', { bookingId: this.data.id });
  }
  // State check methods
  isActive(): boolean {
    return this._status === 'ACTIVE';
  }
  isCompleted(): boolean {
    return this._status === 'COMPLETED';
  }
  isCancelled(): boolean {
    return this._status === 'CANCELLED';
  }
}
