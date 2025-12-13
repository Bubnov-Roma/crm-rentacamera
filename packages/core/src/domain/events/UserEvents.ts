export class UserRegisteredEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly role: string,
    public readonly registeredAt: Date,
  ) {}
}

export class UserLoyaltyLevelChangedEvent {
  constructor(
    public readonly userId: string,
    public readonly oldLevel: string,
    public readonly newLevel: string,
    public readonly changedAt: Date,
  ) {}
}
