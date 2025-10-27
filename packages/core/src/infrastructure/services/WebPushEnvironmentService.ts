import { BrowserEnvironment, EnvironmentCheckResult } from '../types/web-push-types';

export class WebPushEnvironmentService {
  static checkEnvironment(): EnvironmentCheckResult {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return { type: 'NON_BROWSER' };
    }
    const environment: BrowserEnvironment = {
      navigator: {
        serviceWorker: this.getServiceWorkerSafe(navigator),
      },
      window: {
        atob: (encoded: string) => window.atob(encoded),
        fetch: (input: RequestInfo | URL, init?: RequestInit) => window.fetch(input, init),
        PushManager: this.getPushManagerSafe(window),
      },
      Notification: this.getNotificationSafe(),
    };
    if (!environment.navigator.serviceWorker) {
      return { type: 'BROWSER_UNSUPPORTED', reason: 'Service Worker not supported' };
    }
    if (!environment.window.PushManager) {
      return { type: 'BROWSER_UNSUPPORTED', reason: 'Push Manager not supported' };
    }
    return { type: 'BROWSER_SUPPORTED', environment };
  }
  private static getServiceWorkerSafe(nav: Navigator): ServiceWorkerContainer | undefined {
    return 'serviceWorker' in nav ? nav.serviceWorker : undefined;
  }
  private static getPushManagerSafe(win: Window & typeof globalThis): unknown | undefined {
    return 'PushManager' in win ? win.PushManager : undefined;
  }
  private static getNotificationSafe(): BrowserEnvironment['Notification'] {
    if (typeof Notification === 'undefined') {
      return undefined;
    }
    return {
      permission: Notification.permission,
      requestPermission: Notification.requestPermission?.bind(Notification),
    };
  }
  static isSupported(): boolean {
    const result = this.checkEnvironment();
    return result.type === 'BROWSER_SUPPORTED';
  }
}
