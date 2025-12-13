export type MassagerType = 'EMAIL' | 'SMS' | 'TELEGRAM' | 'PUSH';

export type NotificationMessage = {
  readonly title: string;
  readonly body: string;
  readonly type: MassagerType;
  readonly recipient: string;
  readonly metadata?: Record<string, unknown>;
};

export type NotificationTemplate = {
  readonly id: string;
  readonly type: 'BOOKING_CONFIRMATION' | 'REMINDER' | 'PENALTY' | 'TRANSFER' | 'CANCELLATION';
  readonly subject: string;
  readonly body: string;
  readonly channels: MassagerType[];
};

export interface NotificationProvider {
  send(message: NotificationMessage): Promise<boolean>;
  isAvailable(): boolean;
}

export type NotificationConfig = {
  readonly providers: {
    readonly email?: EmailProviderConfig;
    readonly sms?: SMSProviderConfig;
    readonly telegram?: TelegramProviderConfig;
    readonly push?: PushProviderConfig;
  };
  readonly templates: NotificationTemplate[];
  readonly defaultChannels: MassagerType[];
};

export type EmailProviderConfig = {
  readonly provider: 'reserved' | 'brevo' | 'gmail';
  readonly apiKey: string;
  readonly fromEmail: string;
  readonly fromName?: string;
};

export type SMSProviderConfig = {
  readonly provider: 'twilio' | 'textbelt';
  readonly apiKey: string;
  readonly fromNumber: string;
};

export type TelegramProviderConfig = {
  readonly botToken: string;
  readonly chatId?: string;
};

export type PushProviderConfig = {
  readonly provider: 'firebase' | 'web-push';
  readonly vapidPublicKey?: string;
  readonly vapidPrivateKey?: string;
  readonly serviceWorkerPath?: string;
  readonly email: string;
};
