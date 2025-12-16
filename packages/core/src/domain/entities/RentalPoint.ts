export interface RentalPointData {
  readonly id: string;
  readonly name: string;
  readonly code: string;
  address: string;
  isActive: boolean;
  readonly createdAt?: Date;
  updatedAt: Date;
}

export class RentalPoint {
  constructor(private readonly data: RentalPointData) {}

  static create(params: Omit<RentalPointData, 'id'>): RentalPoint {
    const id = `rental_point_${Date.now()}`;
    return new RentalPoint({
      ...params,
      id,
    });
  }
  static reconstitute(data: RentalPointData): RentalPoint {
    return new RentalPoint(data);
  }
  // Business-methods
  activate(): void {
    this.data.isActive = true;
    this.data.updatedAt = new Date();
  }
  deactivate(): void {
    this.data.isActive = false;
    this.data.updatedAt = new Date();
  }
  updateAddress(newAddress: string): void {
    this.data.address = newAddress;
    this.data.updatedAt = new Date();
  }
  // Getters
  get id(): string {
    return this.data.id;
  }
  get name(): string {
    return this.data.name;
  }
  get code(): string {
    return this.data.code;
  }
  get address(): string {
    return this.data.address;
  }
  get isActive(): boolean {
    return this.data.isActive;
  }
  get createdAt(): Date | undefined {
    return this.data.createdAt;
  }
  get updatedAt(): Date | undefined {
    return this.data.updatedAt;
  }
}
