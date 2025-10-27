import { NotificationConfig } from '../types/notification-service-types';

export const notificationConfig: NotificationConfig = {
  providers: {
    email: {
      provider: 'reserved',
      apiKey: process.env.RESEND_API_KEY || 're_123456789', // Получите бесплатный ключ на resend.com
      fromEmail: 'noreply@rentacamera.ru',
      fromName: 'Rentacamera.ru',
    },
    sms: {
      provider: 'textbelt',
      apiKey: process.env.RESEND_API_KEY || 're_123456789', // Получите ключ на textbelt
      fromNumber: '', // add user phone number
    },
    telegram: {
      botToken: process.env.TELEGRAM_BOT_TOKEN || '123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11',
      chatId: process.env.TELEGRAM_CHAT_ID || '-1001234567890', // ID чата для уведомлений
    },
    push: {
      provider: 'web-push',
      vapidPublicKey: process.env.VAPID_PUBLIC_KEY || 'BEl62iUYb3...', // Keys for Web Push
      vapidPrivateKey: process.env.VAPID_PRIVATE_KEY, // Only for server
      email: 'noreply@rentacamera.ru', // For VAPID
      serviceWorkerPath: '/sw.js', // Path to service worker
    },
  },
  templates: [],
  defaultChannels: ['EMAIL', 'TELEGRAM'],
};
