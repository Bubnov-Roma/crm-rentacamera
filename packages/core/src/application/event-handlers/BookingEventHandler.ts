import {
  BookingActivatedEvent,
  BookingCancelledEvent,
  BookingCompletedEvent,
  BookingConfirmedEvent,
  BookingCreatedEvent,
} from '../../domain/events/BookingEvents';
import { IBookingRepository } from '../ports/repositories/IBookingRepository';
import { IUserRepository } from '../ports/repositories/IUserRepository';
import { INotificationService } from '../ports/services/INotificationService';

export class BookingEventHandler {
  constructor(
    private readonly notificationService: INotificationService,
    private readonly userRepository: IUserRepository,
    private readonly bookingRepository: IBookingRepository,
  ) {}

  async handleBookingCreated(event: BookingCreatedEvent): Promise<void> {
    try {
      const user = await this.userRepository.findById(event.userId);
      if (!user) {
        console.warn(`⚠️ User ${event.userId} not found`);
        return;
      }
      const booking = await this.bookingRepository.findById(event.bookingId);
      if (!booking) {
        console.warn(`⚠️ Booking ${event.bookingId} not found`);
        return;
      }

      // Send confirmation to the client
      await this.notificationService.sendBookingConfirmation(user, booking);
      console.log(`✅ Notification sent to user ${user.email}`);

      // Notify managers about a new booking
      await this.notificationService.sendBookingConfirmed(booking);
      console.log('✅ Managers are notified of the new booking');
    } catch (error) {
      console.error('❌ Error processing BookingCreatedEvent:', error);
    }
  }

  async handleBookingConfirmed(event: BookingConfirmedEvent): Promise<void> {
    // Logic after booking confirmation
    try {
      console.log(`Booking ${event.bookingId} confirmed at ${event.confirmedAt}`);

      // TODO:
      // - Создание задач для подготовки оборудования
      // - Уведомление логистического отдела
      // - Обновление аналитики
    } catch (error) {
      console.error('❌ Error BookingConfirmedEvent:', error);
    }
  }

  async handleBookingCancelled(event: BookingCancelledEvent): Promise<void> {
    console.log('❌ Event handling: BookingCancelled', event);

    try {
      const user = await this.userRepository.findById(event.userId);
      const booking = await this.bookingRepository.findById(event.bookingId);

      if (user && booking) {
        await this.notificationService.sendCancellationNotification(
          booking,
          {
            penaltyAmount: event.penaltyAmount
              ? { amount: event.penaltyAmount, currency: 'RUB' }
              : { amount: 0, currency: 'RUB' },
            penaltyReason: `Cancellation: ${event.reason}`,
            isPenaltyApplied: !!event.penaltyAmount,
          },
          user,
        );
        console.log(`✅ Cancellation notice sent to client ${user.email}`);
      }
    } catch (error) {
      console.error('❌ Error handler BookingCancelledEvent:', error);
    }
  }

  async handleBookingCompleted(event: BookingCompletedEvent): Promise<void> {
    console.log('🏁 Event handler: BookingCompleted', event);
    try {
      const user = await this.userRepository.findById(event.userId);
      const booking = await this.bookingRepository.findById(event.bookingId);

      if (user && booking) {
        // Логика после завершения аренды:
        // 1. Отправляем благодарность клиенту
        // 2. Запрашиваем отзыв
        // 3. Обновляем статистику пользователя
        // 4. Отправляем документы (акты, чеки)

        console.log(
          `✅ Rental ${event.bookingId} has ended. Client ${user.email} returned the equipment`,
        );

        // Можно добавить отправку уведомления с просьбой оставить отзыв
        // await this.notificationService.sendReviewRequest(user, booking);
      }
    } catch (error) {
      console.error('❌ Error handler BookingCompletedEvent:', error);
    }
  }

  async handleBookingActivated(event: BookingActivatedEvent): Promise<void> {
    console.log('🚀 Event handler: BookingActivated', event);
    try {
      const booking = await this.bookingRepository.findById(event.bookingId);

      if (booking) {
        // Логика при начале аренды:
        // 1. Отправляем напоминание клиенту о начале аренды
        // 2. Уведомляем менеджеров что клиент забрал оборудование
        // 3. Запускаем таймер для напоминания о возврате

        const user = await this.userRepository.findById(booking.userId);

        if (user) {
          // Отправляем напоминание о начале аренды
          console.log(
            `⏰ Rental of ${event.bookingId} has started. We send a reminder to the client.`,
          );

          // Напоминание о возврате за час до окончания
          await this.notificationService.sendLaterReturnWarning(user, booking);
        }
      }
    } catch (error) {
      console.error('❌ Error handler BookingActivatedEvent:', error);
    }
  }
}
