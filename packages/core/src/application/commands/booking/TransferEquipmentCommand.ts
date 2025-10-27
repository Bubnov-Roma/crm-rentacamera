export class TransferEquipmentCommand {
  constructor(
    public readonly equipmentInstanceId: string,
    public readonly fromLocationId: string,
    public readonly toLocationId: string,
    public readonly scheduledDeparture: Date,
    public readonly reason: 'BOOKING' | 'STOCK' | 'MAINTENANCE',
    public readonly associatedBookingId: string,
    public readonly notes: string,
  ) {}
}
