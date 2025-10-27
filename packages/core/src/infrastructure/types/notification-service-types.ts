export type MassagerType = 'EMAIL' | 'SMS' | 'TELEGRAM' | 'PUSH';

export type NotificationMessage = {
  title: string;
  body: string;
  type: MassagerType;
  recipient: string;
  metadata?: Record<string, unknown>;
};

export type NotificationTemplate = {
  id: string;
  type: 'BOOKING_CONFIRMATION' | 'REMINDER' | 'PENALTY' | 'TRANSFER' | 'CANCELLATION';
  subject: string;
  body: string;
  channels: MassagerType[];
};

export interface NotificationProvider {
  send(message: NotificationMessage): Promise<boolean>;
  isAvailable(): boolean;
}

export type NotificationConfig = {
  providers: {
    email?: EmailProviderConfig;
    sms?: SMSProviderConfig;
    telegram?: TelegramProviderConfig;
    push?: PushProviderConfig;
  };
  templates: NotificationTemplate[];
  defaultChannels: MassagerType[];
};

export type EmailProviderConfig = {
  provider: 'reserved' | 'brevo' | 'gmail';
  apiKey: string;
  fromEmail: string;
  fromName?: string;
};

export type SMSProviderConfig = {
  provider: 'twilio' | 'textbelt';
  apiKey: string;
  fromNumber: string;
};

export type TelegramProviderConfig = {
  botToken: string;
  chatId?: string;
};

export type PushProviderConfig = {
  provider: 'firebase' | 'web-push';
  vapidPublicKey?: string;
  vapidPrivateKey?: string;
  serviceWorkerPath?: string;
  email: string;
};
