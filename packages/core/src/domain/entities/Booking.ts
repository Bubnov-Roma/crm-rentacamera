import { DomainBookingStatus } from '../../infrastructure/types/booking-types';
import { RentalPeriod } from '../value-objects/RentalPeriod';
import { Money } from '../value-objects/Money';
import {
  BookingActivatedEvent,
  BookingCancelledEvent,
  BookingCompletedEvent,
  BookingConfirmedEvent,
  BookingCreatedEvent,
} from '../events/BookingEvents';

export interface DomainEvent<T = object> {
  readonly type: string;
  readonly payload: T;
  readonly timestamp: Date;
  readonly aggregateId: string;
}
export interface BookingData {
  readonly id: string;
  readonly number: string;
  readonly userId: string;
  readonly pickupLocationId: string;
  readonly period: RentalPeriod;
  readonly totalAmount: Money;
  readonly depositAmount: Money;
  readonly status: DomainBookingStatus;
  penaltyAmount?: Money;
  readonly equipmentIds: string[];
}

export class Booking {
  private domainEvents: DomainEvent[] = [];
  private _status: DomainBookingStatus;

  constructor(private data: BookingData) {
    this._status = data.status;
    this.validate();
  }

  private validate(): void {
    if (this.data.totalAmount.amount < 0) {
      throw new Error('Total amount cannot be negative');
    }
    if (this.data.depositAmount.amount < 0) {
      throw new Error('Deposit amount cannot be negative');
    }
  }

  static create(params: Omit<BookingData, 'id' | 'number' | 'status'>): Booking {
    const id = `booking_${Date.now()}`;
    const number = `BK-${Date.now()}`;

    const booking = new Booking({
      ...params,
      id,
      number,
      status: 'PENDING',
    });

    const bookingCreatedEvent = new BookingCreatedEvent(
      booking.id,
      booking.userId,
      booking.equipmentIds,
      {
        startDate: booking.period.startDate,
        endDate: booking.period.endDate,
      },
      booking.totalAmount.amount,
      new Date(),
    );

    booking.addDomainEvent(bookingCreatedEvent);

    return booking;
  }

  static reconstitute(data: BookingData): Booking {
    return new Booking(data);
  }

  confirm(): void {
    if (this._status !== 'PENDING') {
      throw new Error('Only pending bookings can be confirmed');
    }

    this._status = 'CONFIRMED';
    const event = new BookingConfirmedEvent(this.id, this.userId, new Date());
    this.addDomainEvent(event);
  }

  cancel(reason: string, penaltyAmount: Money | null = null): void {
    if (this._status === 'CANCELLED' || this._status === 'COMPLETED') {
      throw new Error(`Cannot cancel booking in ${this._status} status`);
    }

    this._status = 'CANCELLED';

    const event = new BookingCancelledEvent(
      this.id,
      this.userId,
      reason,
      penaltyAmount?.amount || null,
      new Date(),
    );
    this.addDomainEvent(event);
  }

  activate(): void {
    if (this.status !== 'CONFIRMED') {
      throw new Error('Only confirmed bookings can be activated');
    }
    if (this.startDate > new Date()) {
      throw new Error('Cannot activate booking before start date');
    }
    this._status = 'ACTIVE';
    const event = new BookingActivatedEvent(this.id, new Date());
    this.addDomainEvent(event);
  }

  complete(): void {
    if (this.status !== 'ACTIVE') {
      throw new Error('Only active bookings can be completed');
    }

    this._status = 'COMPLETED';
    const event = new BookingCompletedEvent(
      this.id,
      this.userId,
      new Date(), // actualReturnDate
      new Date(), // completedAt
    );
    this.addDomainEvent(event);
  }

  // Domain Events
  private addDomainEvent(
    event:
      | BookingCreatedEvent
      | BookingConfirmedEvent
      | BookingCancelledEvent
      | BookingActivatedEvent
      | BookingCompletedEvent,
  ): void {
    this.domainEvents.push({
      type: event.constructor.name,
      payload: event,
      timestamp: new Date(),
    } as unknown as DomainEvent);
  }

  getDomainEvents(): ReadonlyArray<DomainEvent> {
    return [...this.domainEvents];
  }
  clearDomainEvents(): void {
    this.domainEvents = [];
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
  get equipmentIds(): string[] {
    return this.data.equipmentIds || [];
  }

  // Business logic methods
  calculatePenalty(cancellationDate: Date): Money {
    const hoursUntilStart =
      (this.startDate.getTime() - cancellationDate.getTime()) / (1000 * 60 * 60);

    if (hoursUntilStart > 48) return new Money(0);
    if (hoursUntilStart > 24) return new Money(this.depositAmount.amount * 0.5);
    return new Money(this.depositAmount.amount);
  }

  applyPenalty(penalty: Money): void {
    this.data.penaltyAmount = penalty;
  }

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
