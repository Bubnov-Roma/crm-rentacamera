export type UserRole = 'ADMIN' | 'MANAGER' | 'CLIENT' | 'PARTNER';

export interface UserProfile {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  discountRate: number;
  isActive: boolean;
  isVerified: boolean;
  avatar?: string;
  lastLoginAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User {
  constructor(private profile: UserProfile) {}

  get id(): string {
    return this.profile.id;
  }
  get email(): string {
    return this.profile.email;
  }
  get phone(): string {
    return this.profile.phone;
  }
  get firstName(): string {
    return this.profile.firstName;
  }
  get lastName(): string {
    return this.profile.lastName;
  }
  get role(): UserRole {
    return this.profile.role;
  }
  get discountRate(): number {
    return this.profile.discountRate;
  }
  get isActive(): boolean {
    return this.profile.isActive;
  }
  get isVerified(): boolean {
    return this.profile.isVerified;
  }
  get avatar(): string | undefined {
    return this.profile.avatar;
  }
  get lastLoginAt(): Date | undefined {
    return this.profile.lastLoginAt;
  }
  get createdAt(): Date | undefined {
    return this.profile.createdAt;
  }
  get updatedAt(): Date | undefined {
    return this.profile.updatedAt;
  }

  static fromPrisma(data: {
    id: string;
    email: string;
    phone: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    discountRate: number | null;
    isActive: boolean;
    isVerified: boolean;
    avatar: string | null;
    lastLoginAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }): User {
    return new User({
      id: data.id,
      email: data.email,
      phone: data.phone,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
      discountRate: data.discountRate || 0,
      isActive: data.isActive,
      isVerified: data.isVerified,
      avatar: data.avatar || undefined,
      lastLoginAt: data.lastLoginAt || undefined,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  toPrisma(): {
    id: string;
    email: string;
    phone: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    discountRate: number | null;
    isActive: boolean;
    isVerified: boolean;
    avatar?: string;
    lastLoginAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
  } {
    return {
      id: this.id,
      email: this.email,
      phone: this.phone,
      firstName: this.firstName,
      lastName: this.lastName,
      role: this.role,
      discountRate: this.discountRate,
      isActive: this.isActive,
      isVerified: this.isVerified,
      ...(this.avatar && { avatar: this.avatar }),
      ...(this.lastLoginAt && { lastLoginAt: this.lastLoginAt }),
      ...(this.createdAt && { createdAt: this.createdAt }),
      ...(this.updatedAt && { updatedAt: this.updatedAt }),
    };
  }

  // Business methods
  updateProfile(updates: Partial<UserProfile>): void {
    this.profile = { ...this.profile, ...updates };
  }

  hasDiscount(): boolean {
    return this.discountRate > 0;
  }

  canMakeBooking(): boolean {
    return this.isActive && this.isVerified;
  }

  getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  static create(properties: {
    email: string;
    phone: string;
    firstName: string;
    lastName: string;
    passwordHash: string;
    role?: UserRole;
  }): User {
    return new User({
      id: `user_${Date.now()}`,
      email: properties.email,
      phone: properties.phone,
      firstName: properties.firstName,
      lastName: properties.lastName,
      role: properties.role || 'CLIENT',
      discountRate: 0,
      isActive: true,
      isVerified: false,
    });
  }
}
