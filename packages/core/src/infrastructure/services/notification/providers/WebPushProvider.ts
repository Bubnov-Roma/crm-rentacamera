import {
  NotificationMessage,
  NotificationProvider,
} from 'src/infrastructure/types/notification-service-types';
import { WebPushEnvironmentService } from '../../WebPushEnvironmentService';
import {
  NotificationOptions,
  PushSubscriptionOptions,
  PushSubscriptionJSON,
  BrowserEnvironment,
} from 'src/infrastructure/types/web-push-types';

export interface WebPushConfig {
  vapidPublicKey: string;
  vapidPrivateKey?: string;
  serviceWorkerPath?: string;
}

type WebPushResult<T> = { success: true; data: T } | { success: false; error: string };

export class WebPushProvider implements NotificationProvider {
  private vapidPublicKey: string;
  constructor(private readonly _config: WebPushConfig) {
    this.vapidPublicKey = _config.vapidPublicKey;
  }
  async send(message: NotificationMessage): Promise<boolean> {
    const environmentResult = WebPushEnvironmentService.checkEnvironment();

    if (environmentResult.type !== 'BROWSER_SUPPORTED') {
      console.warn(`Web Push not available: ${environmentResult.type}`);
      return false;
    }
    const notificationResult = await this.showNotification(environmentResult.environment, message);
    return notificationResult.success;
  }
  isAvailable(): boolean {
    return WebPushEnvironmentService.isSupported() && !!this.vapidPublicKey;
  }
  async subscribeUser(): Promise<WebPushResult<PushSubscriptionJSON>> {
    const environmentResult = WebPushEnvironmentService.checkEnvironment();
    if (environmentResult.type !== 'BROWSER_SUPPORTED') {
      return {
        success: false,
        error: `Environment not supported: ${environmentResult.type}`,
      };
    }
    try {
      const { environment } = environmentResult;
      if (!environment.navigator.serviceWorker) {
        return { success: false, error: 'Service Worker not available' };
      }
      const registration = await environment.navigator.serviceWorker.ready;
      const applicationServerKey = this.urlBase64ToUint8Array(this.vapidPublicKey);
      const subscriptionOptions: PushSubscriptionOptions = {
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey,
      };
      const pushManager = registration.pushManager as {
        subscribe(options: PushSubscriptionOptions): Promise<PushSubscription>;
      };
      const subscription = await pushManager.subscribe(subscriptionOptions);
      const subscriptionJSON = this.serializeSubscription(subscription);
      return { success: true, data: subscriptionJSON };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: errorMessage };
    }
  }
  async sendViaServer(
    subscription: PushSubscriptionJSON,
    message: NotificationMessage,
  ): Promise<boolean> {
    const environmentResult = WebPushEnvironmentService.checkEnvironment();
    if (environmentResult.type !== 'BROWSER_SUPPORTED') {
      return false;
    }
    try {
      const response = await environmentResult.environment.window.fetch('/api/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription,
          message: {
            title: message.title,
            body: message.body,
            icon: '/icon-192x192.png',
            data: message.metadata,
          },
        }),
      });
      return response.ok;
    } catch (error) {
      console.error('Failed to send push via server:', error);
      return false;
    }
  }
  private async showNotification(
    environment: BrowserEnvironment,
    message: NotificationMessage,
  ): Promise<WebPushResult<void>> {
    try {
      if (!environment.navigator.serviceWorker) {
        return { success: false, error: 'Service Worker not available' };
      }
      const registration = await environment.navigator.serviceWorker.ready;
      const notificationOptions: NotificationOptions = {
        body: message.body,
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        tag: 'rentacamera-notification',
        data: {
          url: this.getActionUrl(message),
          metadata: message.metadata,
        },
        actions: [
          {
            action: 'view',
            title: 'View',
            icon: '/icon-view-72x72.png',
          },
          {
            action: 'dismiss',
            title: 'Dismiss',
            icon: '/icon-close-72x72.png',
          },
        ],
      };
      const serviceWorker = registration;
      await serviceWorker.showNotification(message.title, notificationOptions);
      return { success: true, data: undefined };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: errorMessage };
    }
  }
  private getActionUrl(message: NotificationMessage): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://rentacamera.ru';
    if (message.metadata && typeof message.metadata === 'object') {
      const metadata = message.metadata;
      if (typeof metadata.bookingId === 'string') {
        return `${baseUrl}/bookings/${metadata.bookingId}`;
      }
      if (typeof metadata.equipmentId === 'string') {
        return `${baseUrl}/equipment/${metadata.equipmentId}`;
      }
    }
    return baseUrl;
  }
  private urlBase64ToUint8Array(base64String: string): ArrayBuffer {
    const environmentResult = WebPushEnvironmentService.checkEnvironment();
    if (environmentResult.type !== 'BROWSER_SUPPORTED') {
      throw new Error('Method only available in supported browser environment');
    }
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray.buffer;
  }
  private serializeSubscription(subscription: PushSubscription): PushSubscriptionJSON {
    const p256dh = subscription.getKey('p256dh');
    const auth = subscription.getKey('auth');
    return {
      endpoint: subscription.endpoint,
      expirationTime: subscription.expirationTime || null,
      keys: {
        p256dh: p256dh ? this.arrayBufferToBase64(p256dh) : '',
        auth: auth ? this.arrayBufferToBase64(auth) : '',
      },
    };
  }
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i += 1) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
}
