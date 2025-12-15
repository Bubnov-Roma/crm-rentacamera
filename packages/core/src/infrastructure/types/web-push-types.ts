export interface NotificationOptions<T = unknown> {
  readonly body?: string;
  readonly icon?: string;
  readonly image?: string;
  readonly badge?: string;
  readonly tag?: string;
  readonly renotify?: boolean;
  readonly silent?: boolean;
  readonly requireInteraction?: boolean;
  readonly data?: T;
  readonly actions?: ReadonlyArray<NotificationAction>;
  readonly vibrate?: number[];
}

export interface NotificationAction {
  readonly action: string;
  readonly title: string;
  readonly icon?: string;
}

export interface PushSubscriptionOptions {
  readonly userVisibleOnly: boolean;
  readonly applicationServerKey?: ArrayBuffer | null;
}

export interface PushSubscriptionJSON {
  readonly endpoint?: string;
  readonly expirationTime?: number | null;
  readonly keys?: {
    readonly p256dh: string;
    readonly auth: string;
  };
}

export interface BrowserEnvironment<T = unknown> {
  readonly navigator: {
    readonly serviceWorker?: ServiceWorkerContainer;
  };
  readonly window: {
    readonly atob: (encoded: string) => string;
    readonly fetch: typeof fetch;
    readonly PushManager?: T;
  };
  readonly Notification?: {
    readonly permission: 'default' | 'granted' | 'denied';
    readonly requestPermission?: () => Promise<'default' | 'granted' | 'denied'>;
  };
}

export type EnvironmentCheckResult =
  | { type: 'BROWSER_SUPPORTED'; environment: BrowserEnvironment }
  | { type: 'BROWSER_UNSUPPORTED'; reason: string }
  | { type: 'NON_BROWSER' };

export interface BrowserAPI {
  readonly navigator: Navigator;
  readonly window: Window & typeof globalThis;
  readonly serviceWorker?: ServiceWorkerContainer;
}
