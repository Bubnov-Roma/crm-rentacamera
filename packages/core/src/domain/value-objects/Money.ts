export interface MoneyData {
  readonly amount: number;
  readonly currency: string;
}

export class Money {
  constructor(
    public readonly amount: number,
    public readonly currency: string = 'RUB',
  ) {
    if (amount < 0) throw new Error('Amount cannot be negative');
    if (!Number.isFinite(amount)) throw new Error('Amount must be a finite number');
  }
}
