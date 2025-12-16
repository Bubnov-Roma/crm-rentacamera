import { UserRole, UserType } from 'src/infrastructure/types/user-types';

export class User {
  constructor(private profile: UserType) {}

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
  get discountRate(): number | null {
    return this.profile.discountRate;
  }
  get isActive(): boolean {
    return this.profile.isActive;
  }
  get isVerified(): boolean {
    return this.profile.isVerified;
  }
  get avatar(): string | null {
    return this.profile.avatar;
  }
  get lastLoginAt(): Date | null {
    return this.profile.lastLoginAt;
  }
  get createdAt(): Date {
    return this.profile.createdAt;
  }
  get updatedAt(): Date {
    return this.profile.updatedAt;
  }

  static fromPrisma(data: UserType): User {
    return new User({
      ...data,
    });
  }

  toPrisma(): UserType {
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
      avatar: this.avatar || null,
      lastLoginAt: this.lastLoginAt || null,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  // Business methods
  updateProfile(updates: Partial<User>): void {
    this.profile = { ...this.profile, ...updates };
  }

  hasDiscount(): boolean {
    return this.discountRate! > 0;
  }

  canMakeBooking(): boolean {
    return this.isActive && this.isVerified;
  }

  getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  /* Fabric method for creating New booking */
  static create(properties: UserType): User {
    return new User({
      ...properties,
      id: `user_${Date.now()}`,
      discountRate: 0,
      isActive: true,
      isVerified: false,
      role: 'CLIENT',
    });
  }

  static reconstitute(data: UserType): User {
    return new User(data);
  }
}
