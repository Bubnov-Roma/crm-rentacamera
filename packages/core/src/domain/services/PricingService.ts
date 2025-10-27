import { Money } from '../value-objects/Money';
import { RentalPeriod } from '../value-objects/RentalPeriod';

export interface IPricingService {
  calculateTotal(params: {
    equipmentItems: Array<{ equipmentInstanceId: string; quantity: number }>;
    period: RentalPeriod;
    discountRate: number;
  }): Promise<Money>;
}

export class PricingService implements IPricingService {
  async calculateTotal(params: {
    equipmentItems: Array<{ equipmentInstanceId: string; quantity: number }>;
    period: RentalPeriod;
    discountRate: number;
  }): Promise<Money> {
    // TODO: Cost calculation logic . Temporary stub
    const hours = params.period.getDurationInHours();
    const baseRate = 100; // Base hour rate

    let totalAmount = params.equipmentItems.reduce((sum, item) => {
      return sum + baseRate * hours * item.quantity;
    }, 0);
    // apply discount
    if (params.discountRate > 0) {
      totalAmount = totalAmount * (1 - params.discountRate / 100);
    }

    return new Money(totalAmount);
  }
  calculateDeposit(totalAmount: Money): Money {
    return new Money(totalAmount.amount * 0.3); // 30% deposit
  }
}
