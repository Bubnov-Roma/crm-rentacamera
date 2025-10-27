import { EquipmentCondition, EquipmentInstanceStatus } from './Equipment';

export interface EquipmentInstanceData {
  id: string;
  serialNumber: string;
  internalId: string;
  equipmentId: string;
  currentLocationId: string;
  status: EquipmentInstanceStatus;
  condition: EquipmentCondition;
  inventoryNumber?: string;
  barcode?: string;
  purchaseDate?: Date;
  purchasePrice?: number;
  lastMaintenanceDate?: Date;
  nextMaintenanceDate: Date;
  configurationDetails?: Record<string, unknown>;
  defectsDescription?: string;
  notes?: string;
  isSubRental: boolean;
  subRentalLocation?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class EquipmentInstance {
  constructor(private readonly data: EquipmentInstanceData) {}

  static create(params: Omit<EquipmentInstanceData, 'id'>): EquipmentInstance {
    const id = `instance_${Date.now()}`;
    return new EquipmentInstance({
      ...params,
      id,
    });
  }

  static reconstitute(data: EquipmentInstanceData): EquipmentInstance {
    return new EquipmentInstance(data);
  }
  // business-methods
  reserve(): void {
    if (this.data.status !== 'AVAILABLE') {
      throw new Error('Cannot reserve equipment that is not available');
    }
    this.data.status = 'RESERVED';
    this.data.updatedAt = new Date();
  }
  release(): void {
    if (this.data.status === 'RESERVED' || this.data.status === 'RENTED') {
      this.data.status = 'AVAILABLE';
      this.data.updatedAt = new Date();
    }
  }
  markAsRented(): void {
    this.data.status = 'RENTED';
    this.data.updatedAt = new Date();
  }
  markAsMaintenance(): void {
    this.data.status = 'MAINTENANCE';
    this.data.updatedAt = new Date();
  }
  updateCondition(condition: EquipmentCondition, notes?: string): void {
    this.data.condition = condition;
    if (notes) {
      this.data.notes = notes;
    }
    this.data.updatedAt = new Date();
  }
  scheduleMaintenance(nextDate: Date): void {
    this.data.lastMaintenanceDate = new Date();
    this.data.nextMaintenanceDate = nextDate;
    this.data.updatedAt = new Date();
  }
  isAvailable(): boolean {
    return this.data.status === 'AVAILABLE' && this.data.condition !== 'DAMAGED';
  }
  needsMaintenance(): boolean {
    return this.data.nextMaintenanceDate && this.data.nextMaintenanceDate <= new Date();
  }
  // Getters
  get id(): string {
    return this.data.id;
  }
  get serialNumber(): string {
    return this.data.serialNumber;
  }
  get internalId(): string {
    return this.data.internalId;
  }
  get equipmentId(): string {
    return this.data.equipmentId;
  }
  get currentLocationId(): string {
    return this.data.currentLocationId;
  }
  get status(): EquipmentInstanceStatus {
    return this.data.status;
  }
  get condition(): EquipmentCondition {
    return this.data.condition;
  }
  get inventoryNumber(): string | undefined {
    return this.data.inventoryNumber;
  }
  get barcode(): string | undefined {
    return this.data.barcode;
  }
  get purchaseDate(): Date | undefined {
    return this.data.purchaseDate;
  }
  get purchasePrice(): number | undefined {
    return this.data.purchasePrice;
  }
  get lastMaintenanceDate(): Date | undefined {
    return this.data.lastMaintenanceDate;
  }
  get nextMaintenanceDate(): Date {
    return this.data.nextMaintenanceDate;
  }
  get configurationDetails(): Record<string, unknown> | undefined {
    return this.data.configurationDetails;
  }
  get defectsDescription(): string | undefined {
    return this.data.defectsDescription;
  }
  get notes(): string | undefined {
    return this.data.notes;
  }
  get isSubRental(): boolean {
    return this.data.isSubRental;
  }
  get subRentalLocation(): string | undefined {
    return this.data.subRentalLocation;
  }
  get createdAt(): Date {
    return this.data.createdAt;
  }
  get updatedAt(): Date {
    return this.data.updatedAt;
  }
}
