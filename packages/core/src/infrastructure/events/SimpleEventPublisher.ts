import { IEventPublisher } from 'src/application/ports/events/IEventPublisher';

type EventHandler<T extends object> = (event: T) => Promise<void>;

export class SimpleEventPublisher implements IEventPublisher {
  private handlers: Map<string, EventHandler<object>[]> = new Map();
  async publish<T extends object>(event: T): Promise<void> {
    const eventType = event.constructor.name;
    const eventHandlers = this.handlers.get(eventType) || [];
    console.log(`📢 Public event: ${eventType}`, event);
    const promises = eventHandlers.map(async (handler, index) => {
      try {
        console.log(`  → Handler ${index + 1} for ${eventType}`);
        await handler(event);
        console.log(`  ✅ Handler ${index + 1} completed`);
      } catch (error) {
        console.error(`  ❌ Handler error ${index + 1}:`, error);
      }
    });
    await Promise.all(promises);
  }
  subscribe<T extends object>(eventType: string, handler: (event: T) => Promise<void>): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler as EventHandler<object>);
    console.log(`✅ The event handler is subscribed: ${eventType}`);
  }
  getHandlerCount(eventType: string): number {
    return this.handlers.get(eventType)?.length || 0;
  }
}
