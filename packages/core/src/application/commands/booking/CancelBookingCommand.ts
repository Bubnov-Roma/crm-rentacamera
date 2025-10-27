export class CancelBookingCommand {
  constructor(
    public readonly bookingId: string,
    public readonly reason: string,
    public readonly cancelledBy: string,
  ) {}
}
