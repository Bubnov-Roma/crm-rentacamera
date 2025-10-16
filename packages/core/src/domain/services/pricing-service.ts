export class PricingService {
  async calculateTotal(
    equipmentItems: Array<{ equipmentInstanceId: string; quantity: number }>,
    startDate: Date,
    endDate: Date,
    discountRate: number,
  ): Promise<number> {
    // Cost calculation logic
    // Temporary stub
    const hours = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60));
    const baseRate = 100; // Base hour rate

    let total = equipmentItems.reduce((sum, item) => {
      return sum + baseRate * hours * item.quantity;
    }, 0);
    // apply discount
    if (discountRate > 0) {
      total = total * (1 - discountRate / 100);
    }

    return total;
  }
}
