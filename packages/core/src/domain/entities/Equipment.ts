import { Money, MoneyData } from '../value-objects/Money';

export type EquipmentStatus = 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED';
export type EquipmentInstanceStatus =
  | 'AVAILABLE'
  | 'RENTED'
  | 'MAINTENANCE'
  | 'RESERVED'
  | 'DAMAGED'
  | 'LOST';
export type EquipmentCondition = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'DAMAGED';

export interface EquipmentSpecificationsData {
  readonly weight?: number;
  readonly dimensions?: string;
  readonly resolution?: string;
  readonly sensorSize?: string;
  readonly isoRange?: string;
  readonly shutterSpeed?: string;
  readonly customFields?: string;
}

export class EquipmentSpecifications {
  constructor(
    public readonly weight?: number,
    public readonly dimensions?: string,
    public readonly resolution?: string,
    public readonly sensorSize?: string,
    public readonly isoRange?: string,
    public readonly shutterSpeed?: string,
    public readonly customFields?: string,
  ) {}

  static fromPrisma(data: EquipmentSpecifications): EquipmentSpecifications {
    if (typeof data !== 'object' || data === null) {
      return new EquipmentSpecifications();
    }
    return new EquipmentSpecifications(
      data.weight,
      data.dimensions,
      data.resolution,
      data.sensorSize,
      data.isoRange,
      data.shutterSpeed,
      data.customFields,
    );
  }

  toPrisma(): EquipmentSpecificationsData {
    return {
      weight: this.weight,
      dimensions: this.dimensions,
      resolution: this.resolution,
      sensorSize: this.sensorSize,
      isoRange: this.isoRange,
      shutterSpeed: this.shutterSpeed,
      customFields: this.customFields,
    };
  }
}

export interface EquipmentData {
  readonly id: string;
  readonly sku: string;
  name: string;
  description: string | null;
  readonly categoryId: string;
  brand: string;
  model: string;
  readonly serialNumber: string;
  specifications: EquipmentSpecifications;
  baseHourlyRate: Money;
  baseDailyRate: MoneyData;
  baseMonthlyRate: MoneyData;
  depositAmount: MoneyData;
  replacementCost: MoneyData;
  readonly pricingMatrix: string;
  readonly tags: string[];
  readonly comments: string | null;
  readonly images: string[];
  readonly manuals: string[];
  status: EquipmentStatus;
  isPublic: boolean;
  partnerId?: string;
  readonly createdAt: Date;
  updatedAt: Date;
}

export class Equipment {
  constructor(private readonly data: EquipmentData) {}

  static create(params: Omit<EquipmentData, 'id' | 'createsAt' | 'updateAt'>): Equipment {
    const now = new Date();
    return new Equipment({
      ...params,
      id: `equipment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(data: EquipmentData): Equipment {
    return new Equipment(data);
  }

  static fromPrisma(prismaData: EquipmentData): Equipment {
    const specifications = EquipmentSpecifications.fromPrisma(prismaData.specifications);
    const pricingMatrix = prismaData.pricingMatrix;
    return new Equipment({
      id: prismaData.id,
      sku: prismaData.sku,
      name: prismaData.name,
      description: prismaData.description,
      categoryId: prismaData.categoryId,
      brand: prismaData.brand,
      model: prismaData.model,
      serialNumber: prismaData.serialNumber,
      specifications,
      baseHourlyRate: prismaData.baseHourlyRate,
      baseDailyRate: prismaData.baseDailyRate,
      baseMonthlyRate: prismaData.baseMonthlyRate,
      depositAmount: prismaData.depositAmount,
      replacementCost: prismaData.replacementCost,
      pricingMatrix,
      tags: prismaData.tags || [],
      comments: prismaData.comments,
      images: prismaData.images || [],
      manuals: prismaData.manuals || [],
      status: prismaData.status,
      isPublic: prismaData.isPublic,
      partnerId: prismaData.partnerId,
      createdAt: prismaData.createdAt,
      updatedAt: prismaData.updatedAt,
    });
  }

  toPrisma(): EquipmentData {
    return {
      id: this.data.id,
      sku: this.data.sku,
      name: this.data.name,
      description: this.data.description,
      categoryId: this.data.categoryId,
      brand: this.data.brand,
      model: this.data.model,
      serialNumber: this.data.serialNumber,
      specifications: this.data.specifications,
      baseHourlyRate: this.data.baseHourlyRate,
      baseDailyRate: this.data.baseDailyRate,
      baseMonthlyRate: this.data.baseMonthlyRate,
      depositAmount: this.data.depositAmount,
      replacementCost: this.data.replacementCost,
      pricingMatrix: this.data.pricingMatrix,
      tags: this.data.tags,
      comments: this.data.comments,
      images: this.data.images,
      manuals: this.data.manuals,
      status: this.data.status,
      isPublic: this.data.isPublic,
      partnerId: this.data.partnerId,
      createdAt: this.data.createdAt,
      updatedAt: this.data.updatedAt,
    };
  }

  // Business methods
  updatePricing(hourlyRate: MoneyData, dailyRate: MoneyData, monthlyRate: MoneyData): void {
    this.data.baseHourlyRate = hourlyRate;
    this.data.baseDailyRate = dailyRate;
    this.data.baseMonthlyRate = monthlyRate;
    this.data.updatedAt = new Date();
  }
  updateStatus(status: EquipmentStatus): void {
    this.data.status = status;
    this.data.updatedAt = new Date();
  }
  addImage(imageUrl: string): void {
    this.data.images.push(imageUrl);
    this.data.updatedAt = new Date();
  }
  addTag(tag: string): void {
    if (!this.data.tags.includes(tag)) {
      this.data.tags.push(tag);
      this.data.updatedAt = new Date();
    }
  }
  isAvailableForRent(): boolean {
    return this.data.status === 'ACTIVE' && this.data.isPublic;
  }
  updateInfo(params: {
    name?: string;
    description?: string;
    brand?: string;
    model?: string;
    specifications?: EquipmentSpecifications;
  }): void {
    if (params.name) this.data.name = params.name;
    if (params.description) this.data.description = params.description;
    if (params.brand) this.data.brand = params.brand;
    if (params.model) this.data.model = params.model;
    if (params.specifications) this.data.specifications = params.specifications;
    this.data.updatedAt = new Date();
  }
  updateFinancials(depositAmount: MoneyData, replacementCost: MoneyData): void {
    this.data.depositAmount = depositAmount;
    this.data.replacementCost = replacementCost;
    this.data.updatedAt = new Date();
  }
  setPublicVisibility(isPublic: boolean): void {
    this.data.isPublic = isPublic;
    this.data.updatedAt = new Date();
  }
  assignToPartner(partnerId: string): void {
    this.data.partnerId = partnerId;
    this.data.updatedAt = new Date();
  }
  unassignFromPartner(): void {
    this.data.partnerId = undefined;
    this.data.updatedAt = new Date();
  }

  // Getters
  get id(): string {
    return this.data.id;
  }
  get sku(): string {
    return this.data.sku;
  }
  get name(): string {
    return this.data.name;
  }
  get description(): string | null {
    return this.data.description;
  }
  get categoryId(): string {
    return this.data.categoryId;
  }
  get brand(): string {
    return this.data.brand;
  }
  get model(): string {
    return this.data.model;
  }
  get serialNumber(): string {
    return this.data.serialNumber;
  }
  get specifications(): EquipmentSpecifications {
    return this.data.specifications;
  }
  get baseHourlyRate(): MoneyData {
    return this.data.baseHourlyRate;
  }
  get baseDailyRate(): MoneyData {
    return this.data.baseDailyRate;
  }
  get baseMonthlyRate(): MoneyData {
    return this.data.baseMonthlyRate;
  }
  get depositAmount(): MoneyData {
    return this.data.depositAmount;
  }
  get replacementCost(): MoneyData {
    return this.data.replacementCost;
  }
  get pricingMatrix(): string {
    return this.data.pricingMatrix;
  }
  get tags(): string[] {
    return [...this.data.tags];
  }
  get images(): string[] {
    return [...this.data.images];
  }
  get manuals(): string[] {
    return [...this.data.manuals];
  }
  get status(): EquipmentStatus {
    return this.data.status;
  }
  get isPublic(): boolean {
    return this.data.isPublic;
  }
  get partnerId(): string | undefined {
    return this.data.partnerId;
  }
  get createdAt(): Date {
    return this.data.createdAt;
  }
  get updatedAt(): Date {
    return this.data.updatedAt;
  }
}
