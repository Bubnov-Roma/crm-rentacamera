import { NotificationTemplate } from '../../../../infrastructure/types/notification-service-types';

export const BookingTemplates: Record<string, NotificationTemplate> = {
  CONFIRMATION: {
    id: 'booking_confirmation',
    type: 'BOOKING_CONFIRMATION' as const,
    subject: 'Бронь подтверждена - Rentacamera.ru',
    body: `Ваш заказ #{bookingNumber} забронирован! 🎉
    
    Сумма: {totalAmount} ₽
    Период аренды: с {startDate} по {endDate}
    Место получения: {location}
    
    Спасибо за выбор нашей компании!`,
    channels: ['EMAIL', 'TELEGRAM'] as const,
  },
  REMINDER: {
    id: 'return_reminder',
    type: 'REMINDER',
    subject: 'Напоминание о возврате оборудования',
    body: `Напоминаем, что заказ #{bookingNumber} необходимо вернуть до {returnTime}.

        Пожалуйста, не забудьте вернуть оборудование вовремя!`,
    channels: ['TELEGRAM', 'SMS'],
  },
  PENALTY: {
    id: 'penalty_notification',
    type: 'PENALTY',
    subject: 'Штраф за нарушение условий аренды',
    body: `По заказу #{bookingNumber} начислен штраф: {penaltyAmount} ₽.
        
        Причина: {penaltyReason}
        
        Для уточнения деталей свяжитесь с нашим менеджером.`,
    channels: ['EMAIL'],
  },
  TRANSFER: {
    id: 'equipment_transfer',
    type: 'TRANSFER',
    subject: 'Перемещение оборудования между филиалами',
    body: `Оборудование {equipmentName} ({serialNumber}) запланировано к перемещению из {fromLocation} в {toLocation}.
                    
            Дата отправки: {scheduledDate}
            Примерная дата прибытия: {estimatedArrival}
          `,
    channels: ['EMAIL', 'TELEGRAM'],
  },
  CANCELLATION: {
    id: 'booking_cancellation',
    type: 'CANCELLATION',
    subject: 'Отмена бронирования',
    body: `Заказ #{bookingNumber} отменен.{penaltyInfo}
           
           Для уточнения деталей свяжитесь с нашим менеджером.
          `,
    channels: ['EMAIL'],
  },
} as const;
