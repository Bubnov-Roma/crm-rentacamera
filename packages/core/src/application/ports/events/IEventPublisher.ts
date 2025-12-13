export interface IEventPublisher {
  publish<T extends object>(event: T): Promise<void>;
  subscribe<T extends object>(eventType: string, handler: (event: T) => Promise<void>): void;
}
