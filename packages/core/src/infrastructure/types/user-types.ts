export type UserRole = 'ADMIN' | 'MANAGER' | 'CLIENT' | 'PARTNER';

export type UserType = {
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
};
