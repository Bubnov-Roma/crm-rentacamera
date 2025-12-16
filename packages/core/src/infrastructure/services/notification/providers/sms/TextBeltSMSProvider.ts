import {
  NotificationMessage,
  NotificationProvider,
} from '../../../../../infrastructure/types/notification-service-types';

export class TextBeltSMSProvider implements NotificationProvider {
  constructor(private config: { apiKey?: string }) {}

  async send(message: NotificationMessage): Promise<boolean> {
    try {
      const response = await fetch('https://textbelt.com/text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: message.recipient,
          message: `${message.title}: ${message.body}`,
          key: this.config.apiKey || 'textbelt',
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        console.error('TextBelt API error:', result);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Failed to send SMS via TextBelt:', error);
      return false;
    }
  }
  isAvailable(): boolean {
    return true;
  }
}
