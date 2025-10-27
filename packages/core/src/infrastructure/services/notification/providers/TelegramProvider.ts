import {
  NotificationMessage,
  NotificationProvider,
} from 'src/infrastructure/types/notification-service-types';

export class TelegramProvider implements NotificationProvider {
  constructor(private config: { botToken: string; chatId?: string }) {}

  async send(message: NotificationMessage): Promise<boolean> {
    try {
      const chatId = message.recipient.startsWith('-') ? message.recipient : this.config.chatId;
      if (!chatId) {
        console.error('No chatId provided for Telegram notification');
        return false;
      }
      const url = `https://api.telegram.org/bot${this.config.botToken}/sendMessage`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: `*${message.title}*\n\n${message.body}`,
          parse_node: 'Markdown',
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        console.error('Telegram API error:', result);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Failed to send Telegram message:', error);
      return false;
    }
  }
  isAvailable(): boolean {
    return !!this.config.botToken;
  }
}
