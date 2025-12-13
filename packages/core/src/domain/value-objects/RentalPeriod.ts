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
  getDurationInDays(): number {
    return Math.ceil(this.getDurationInHours() / 24);
  }

  contains(date: Date): boolean {
    return date >= this.startDate && date <= this.endDate;
  }

  overlaps(other: RentalPeriod): boolean {
    return this.startDate < other.endDate && this.endDate > other.startDate;
  }
}
