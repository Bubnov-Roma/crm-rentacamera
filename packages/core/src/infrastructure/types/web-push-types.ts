export interface NotificationOptions {
  body?: string;
  icon?: string;
  image?: string;
  badge?: string;
  tag?: string;
  renotify?: boolean;
  silent?: boolean;
  requireInteraction?: boolean;
  data?: unknown;
  actions?: ReadonlyArray<NotificationAction>;
  vibrate?: number[];
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

export interface BrowserEnvironment {
  readonly navigator: {
    readonly serviceWorker?: ServiceWorkerContainer;
  };
  readonly window: {
    readonly atob: (encoded: string) => string;
    readonly fetch: typeof fetch;
    readonly PushManager?: unknown;
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
  navigator: Navigator;
  window: Window & typeof globalThis;
  serviceWorker?: ServiceWorkerContainer;
}
