import {
  NotificationMessage,
  NotificationProvider,
} from 'src/infrastructure/types/notification-service-types';

export interface ServerWebPushConfig {
  readonly vapidPublicKey: string;
  readonly vapidPrivateKey: string;
  readonly email: string;
}

export class ServerWebPushProvider implements NotificationProvider {
  constructor(private readonly _config: ServerWebPushConfig) {}
  async send(message: NotificationMessage): Promise<boolean> {
    // Этот провайдер работает на сервере и отправляет push через web-push библиотеку
    try {
      // В реальной реализации здесь будет вызов web-push
      console.warn('Server Web Push would send:', {
        to: message.recipient, // recipient должен быть PushSubscription JSON
        title: message.title,
        body: message.body,
        metadata: message.metadata,
      });
      // Заглушка - в реальности нужно реализовать с web-push
      return true;
    } catch (error) {
      console.error('Failed to send server web push:', error);
      return false;
    }
  }
  isAvailable(): boolean {
    return true;
  }
  async sendToUser(userSubscription: string, message: NotificationMessage): Promise<boolean> {
    try {
      const subscription = JSON.parse(userSubscription);

      // Здесь будет реальная отправка через web-push
      // const result = await webPush.sendNotification(subscription, JSON.stringify({
      //   title: message.title,
      //   body: message.body,
      //   icon: '/icon-192x192.png',
      //   data: message.metadata,
      // }));

      console.warn('Would send to user:', { subscription, message });
      return true;
    } catch (error) {
      console.error('Failed to send to user:', error);
      return false;
    }
  }
}
