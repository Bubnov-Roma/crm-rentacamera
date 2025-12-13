export class BookingCreatedEvent {
  constructor(
    public readonly bookingId: string,
    public readonly userId: string,
    public readonly equipmentIds: string[],
    public readonly period: { startDate: Date; endDate: Date },
    public readonly totalAmount: number,
    public readonly createdAt: Date,
  ) {}
}

export class BookingConfirmedEvent {
  constructor(
    public readonly bookingId: string,
    public readonly userId: string,
    public readonly confirmedAt: Date,
  ) {}
}

export class BookingCancelledEvent {
  constructor(
    public readonly bookingId: string,
    public readonly userId: string,
    public readonly reason: string,
    public readonly penaltyAmount: number | null,
    public readonly cancelledAt: Date,
  ) {}
}

export class BookingCompletedEvent {
  constructor(
    public readonly bookingId: string,
    public readonly userId: string,
    public readonly actualReturnDate: Date,
    public readonly completedAt: Date,
  ) {}
}

export class BookingActivatedEvent {
  constructor(
    public readonly bookingId: string,
    public readonly activatedAt: Date,
  ) {}
}
