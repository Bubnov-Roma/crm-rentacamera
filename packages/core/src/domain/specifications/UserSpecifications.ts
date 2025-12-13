import { User } from '../entities/User';

export class UserCanMakeBookingSpecification {
  isSatisfiedBy(user: User): boolean {
    return user.isActive && user.isVerified;
  }
}

export class UserEligibleForLoyaltyUpgradeSpecification {
  isSatisfiedBy(user: User, totalSpent: number, totalBookings: number): boolean {
    return user.isActive && totalBookings >= 5 && totalSpent >= 10000;
  }
}
