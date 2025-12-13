export class EquipmentMaintenanceRequiredEvent {
  constructor(
    public readonly equipmentId: string,
    public readonly instanceId: string,
    public readonly maintenanceType: string,
    public readonly requiredBy: Date,
    public readonly reason: string,
  ) {}
}

export class EquipmentLowStockEvent {
  constructor(
    public readonly equipmentId: string,
    public readonly currentStock: number,
    public readonly minimumStock: number,
    public readonly locationId: string,
  ) {}
}
