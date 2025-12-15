export abstract class DomainException extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly metadata?: unknown,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}
