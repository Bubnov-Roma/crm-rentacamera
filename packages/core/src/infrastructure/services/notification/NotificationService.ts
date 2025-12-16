import { User } from '../../../domain/entities/User';
import {
  MassagerType,
  NotificationConfig,
  NotificationMessage,
  NotificationProvider,
  NotificationTemplate,
} from '../../types/notification-service-types';
import { ResendEmailProvider } from './providers/email/ResendEmailProvider';
import { TelegramProvider } from './providers/telegram/TelegramProvider';
import { TextBeltSMSProvider } from './providers/sms/TextBeltSMSProvider';
import { Booking } from '../../../domain/entities/Booking';
import { PenaltyCalculationResult } from '../../../domain/services/PenaltyService';
import { INotificationService } from '../../../application/ports/services/INotificationService';
import { Equipment } from '../../../domain/entities/Equipment';
import { RentalPoint } from '../../../domain/entities/RentalPoint';
import {
  NotificationRecipient,
  RecipientFactory,
} from '../../../domain/value-objects/NotificationRecipient';
import { WebPushProviderFactory } from '../../../infrastructure/services/notification/providers/push/web-push/WebPushProviderFactory';
import { BookingTemplates } from './templates/BookingTemplates';

export class NotificationService implements INotificationService {
  private readonly providers: Map<string, NotificationProvider> = new Map();
  private readonly templates: Map<string, NotificationTemplate> = new Map();

  constructor(private readonly config: NotificationConfig) {
    this.initializeProviders();
    this.initializeTemplates();
  }

  private initializeProviders(): void {
    // Email Provider (https://resend.com)
    if (this.config.providers.email) {
      this.providers.set('EMAIL', new ResendEmailProvider(this.config.providers.email));
    }
    // SMS Provider TextBelt
    if (this.config.providers.sms) {
      this.providers.set('SMS', new TextBeltSMSProvider(this.config.providers.sms));
    }
    // Telegram Provider
    if (this.config.providers.telegram) {
      this.providers.set('TELEGRAM', new TelegramProvider(this.config.providers.telegram));
    }
    // Push Provider
    if (this.config.providers.push) {
      const pushProvider = WebPushProviderFactory.createUniversalProvider(
        this.config.providers.push,
      );
      this.providers.set('PUSH', pushProvider);
    }
  }
  private initializeTemplates(): void {
    const defaultTemplates: NotificationTemplate[] = [
      BookingTemplates.CONFIRMATION,
      BookingTemplates.REMINDER,
      BookingTemplates.PENALTY,
      BookingTemplates.TRANSFER,
      BookingTemplates.CANCELLATION,
    ];
    defaultTemplates.forEach((template) => {
      this.templates.set(template.type, template);
    });
    this.config.templates?.forEach((template) => {
      this.templates.set(template.type, template);
    });
  }
  async sendBookingConfirmation(user: User, booking: Booking): Promise<void> {
    const template = this.templates.get('BOOKING_CONFIRMATION');
    if (!template) return;
    const recipient = RecipientFactory.createUserRecipient(user);
    const message = this.buildMessageFromTemplate(
      template,
      {
        bookingNumber: booking.number,
        totalAmount: `${booking.totalAmount.amount}`,
        startDate: booking.period.startDate.toLocaleDateString('ru-RU'),
        endDate: booking.period.endDate.toLocaleDateString('ru-RU'),
        location: booking.pickupLocationId,
      },
      recipient,
    );
    await this.sendToChannels(message, template.channels);
  }
  async sendBookingConfirmed(booking: Booking): Promise<void> {
    // Уведомление для менеджера о новом бронировании
    const managerMessage: NotificationMessage = {
      title: 'New booking',
      body: `New order ${booking.number} from ${booking.userId}. Sum: ${booking.totalAmount.amount} ₽`,
      type: 'TELEGRAM',
      recipient: this.config.providers.telegram?.chatId || '',
    };
    await this.sendNotification(managerMessage);
  }
  async sendLaterReturnWarning(user: User, booking: Booking): Promise<void> {
    const template = this.templates.get('REMINDER');
    if (!template) return;
    const message = this.buildMessageFromTemplate(
      template,
      {
        bookingNumber: booking.number,
        returnTime: booking.period.endDate.toLocaleTimeString('ru-RU', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      },
      user,
    );
    await this.sendToChannels(message, template.channels);
  }

  async sendPenaltyNotification(
    user: User,
    booking: Booking,
    penaltyAmount: number,
    reason: string,
  ): Promise<void> {
    const template = this.templates.get('PENALTY');
    if (!template) return;
    const message = this.buildMessageFromTemplate(
      template,
      {
        bookingNumber: booking.number,
        penaltyAmount: `${penaltyAmount}`,
        penaltyReason: reason,
      },
      user,
    );
    await this.sendToChannels(message, template.channels);
  }
  async sendCancellationNotification(
    booking: Booking,
    penaltyResult: PenaltyCalculationResult,
    user?: User,
  ): Promise<void> {
    const template = this.templates.get('CANCELLATION');
    if (!template) return;
    const penaltyInfo = penaltyResult.penaltyAmount
      ? ` Штраф: ${penaltyResult.penaltyAmount.amount} ₽`
      : '';
    if (!user) {
      console.warn('User not found for booking cancellation notification');
      return;
    }
    const message = this.buildMessageFromTemplate(
      template,
      {
        bookingNumber: booking.number,
        penaltyInfo,
      },
      user,
    );
    await this.sendToChannels(message, template.channels);
  }
  async sendTransferNotification(
    equipment: Equipment,
    fromLocation: RentalPoint,
    toLocation: RentalPoint,
    scheduledDate: Date,
    estimatedArrival: Date,
  ): Promise<void> {
    const template = this.templates.get('EQUIPMENT_TRANSFER');
    if (!template) return;
    const recipient = RecipientFactory.createLogisticsDepartment();
    const message = this.buildMessageFromTemplate(
      template,
      {
        equipmentName: equipment.name,
        serialNumber: equipment.serialNumber,
        fromLocation: fromLocation.name,
        toLocation: toLocation.name,
        scheduledDate: scheduledDate.toLocaleDateString('ru-RU'),
        estimatedArrival: estimatedArrival.toLocaleDateString('ru-RU'),
      },
      recipient,
    );
    await this.sendToChannels(message, template.channels);
  }
  private buildMessageFromTemplate(
    template: NotificationTemplate,
    variables: Record<string, string>,
    recipient: NotificationRecipient,
  ): Omit<NotificationMessage, 'type'> {
    let subject = template.subject;
    let body = template.body;
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{${key}}`;
      subject = subject.replace(placeholder, value);
      body = body.replace(placeholder, value);
    });
    return {
      title: subject,
      body,
      recipient: this.getRecipientByPreference(recipient),
    };
  }
  private getRecipientByPreference(recipient: NotificationRecipient): string {
    if (recipient.phone) return recipient.phone;
    if (recipient.email) return recipient.email;
    return '';
  }
  private async sendToChannels(
    message: Omit<NotificationMessage, 'type'>,
    channels: MassagerType[],
  ): Promise<void> {
    const promises = channels.map((channel) => {
      const provider = this.providers.get(channel);
      if (!provider || !provider.isAvailable()) return Promise.resolve(false);
      return this.sendNotification({
        ...message,
        type: channel,
      });
    });
    await Promise.all(promises);
  }
  async sendNotification(message: NotificationMessage): Promise<void> {
    try {
      const provider = this.providers.get(message.type);
      if (!provider) {
        console.warn(`No provider available for type: ${message.type}`);
        return;
      }
      if (!provider.isAvailable()) {
        console.warn(`Provider not available for type: ${message.type}`);
        return;
      }
      const success = await provider.send(message);
      if (!success) {
        console.error(`Failed to send notification via ${message.type}`);
        // Fallback
        await this.tryFallbackChannels(message);
      }
    } catch (error) {
      console.error(`Error sending notification:`, error);
    }
  }
  private async tryFallbackChannels(originalMessage: NotificationMessage): Promise<void> {
    const FallbackOrder: MassagerType[] = ['TELEGRAM', 'EMAIL', 'SMS', 'PUSH'];
    for (const channel of FallbackOrder) {
      if (channel === originalMessage.type) continue;
      const provider = this.providers.get(channel);
      if (provider && provider.isAvailable()) {
        console.warn(`Trying fallback channel: ${channel}`);
        const fallbackMessage = {
          ...originalMessage,
          type: channel,
          recipient: this.getFallbackRecipient(originalMessage.recipient, channel),
        };
        const success = await provider.send(fallbackMessage);
        if (success) break;
      }
    }
  }
  private getFallbackRecipient(originalRecipient: string, channel: string): string {
    //TODO Здесь можно добавить логику маппинга получателей между каналами
    // Например, по userId найти соответствующий telegram chatId
    return originalRecipient + channel;
  }
}
