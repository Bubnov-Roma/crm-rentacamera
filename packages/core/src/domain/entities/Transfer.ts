export interface TransferData {
  readonly id: string;
  readonly equipmentInstanceId: string;
  readonly toLocationId: string;
  readonly fromLocationId: string;
  readonly scheduledDeparture: Date;
  readonly estimatedArrival: Date;
  actualDeparture?: Date;
  actualArrival?: Date;
  status: TransferStatus;
  readonly transferType: TransferType;
  readonly associatedBookingId?: string;
  readonly notes?: string;
  readonly createdAt: Date;
  updatedAt: Date;
}

export type TransferStatus = 'PENDING' | 'SCHEDULED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
export type TransferType = 'BOOKING_RELATED' | 'STOCK_BALANCE' | 'MAINTENANCE';

export class EquipmentTransfer {
  constructor(private readonly data: TransferData) {}

  static create(params: Omit<TransferData, 'id' | 'createdAt' | 'updatedAt'>): EquipmentTransfer {
    return new EquipmentTransfer({
      ...params,
      id: `transfer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'SCHEDULED',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static reconstitute(data: TransferData): EquipmentTransfer {
    return new EquipmentTransfer(data);
  }
  markAdInTransit(): void {
    this.data.status = 'IN_TRANSIT';
    this.data.actualDeparture = new Date();
    this.data.updatedAt = new Date();
  }
  markAsDelivered(): void {
    this.data.status = 'DELIVERED';
    this.data.actualArrival = new Date();
    this.data.updatedAt = new Date();
  }
  cancel(): void {
    this.data.status = 'CANCELLED';
    this.data.updatedAt = new Date();
  }
  // Getters
  get id() {
    return this.data.id;
  }
  get equipmentInstanceId() {
    return this.data.equipmentInstanceId;
  }
  get fromLocationId() {
    return this.data.fromLocationId;
  }
  get toLocationId() {
    return this.data.toLocationId;
  }
  get scheduledDeparture() {
    return this.data.scheduledDeparture;
  }
  get estimatedArrival() {
    return this.data.estimatedArrival;
  }
  get actualDeparture() {
    return this.data.actualDeparture;
  }
  get actualArrival() {
    return this.data.actualArrival;
  }
  get status() {
    return this.data.status;
  }
  get transferType() {
    return this.data.transferType;
  }
  get associatedBookingId() {
    return this.data.associatedBookingId;
  }
  get notes() {
    return this.data.notes;
  }
  get createdAt() {
    return this.data.createdAt;
  }
  get updatedAt() {
    return this.data.updatedAt;
  }
}
