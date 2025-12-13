import {
  NotificationProvider,
  PushProviderConfig,
} from 'src/infrastructure/types/notification-service-types';
import { ClientWebPushProvider, WebPushConfig } from './ClientWebPushProvider';
import { ServerWebPushProvider, ServerWebPushConfig } from './ServerWebPushProvider';

export class WebPushProviderFactory {
  static createClientProvider(config: WebPushConfig): NotificationProvider {
    return new ClientWebPushProvider(config);
  }

  static createServerProvider(config: ServerWebPushConfig): NotificationProvider {
    return new ServerWebPushProvider(config);
  }

  static createUniversalProvider(config: PushProviderConfig): NotificationProvider {
    if (typeof window !== 'undefined') {
      if (!config.vapidPublicKey) {
        throw new Error('vapidPublicKey is required for client-side WebPush');
      }
      const clientConfig: WebPushConfig = {
        vapidPublicKey: config.vapidPublicKey,
        vapidPrivateKey: config.vapidPrivateKey,
        serviceWorkerPath: config.serviceWorkerPath,
      };
      return new ClientWebPushProvider(clientConfig);
    } else {
      if (!config.vapidPrivateKey || !config.email) {
        throw new Error('vapidPrivateKey and email are required for server-side WebPush');
      }
      const serverConfig: ServerWebPushConfig = {
        vapidPublicKey: config.vapidPublicKey || '',
        vapidPrivateKey: config.vapidPrivateKey,
        email: config.email,
      };
      return new ServerWebPushProvider(serverConfig);
    }
  }
}
