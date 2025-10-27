export class CreateBookingCommand {
  constructor(
    public readonly userId: string,
    public readonly pickupLocationId: string,
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly equipmentItems: Array<{
      // TODO - replace to ReadonlyArray if possible
      equipmentInstanceId: string;
      quantity: number;
    }>,
  ) {}
}
