export class RentalPeriod {
  constructor(
    public readonly startDate: Date,
    public readonly endDate: Date,
  ) {
    if (startDate >= endDate) {
      throw new Error('Start date must be before end date');
    }
  }

  getDurationInHours(): number {
    return Math.ceil((this.endDate.getTime() - this.startDate.getTime()) / (1000 * 60 * 60));
  }
}
