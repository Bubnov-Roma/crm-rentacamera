import { User } from '../entities/User';

export interface NotificationRecipient {
  readonly id: string;
  readonly email: string;
  readonly phone: string;
  readonly name?: string;
}

export class RecipientFactory {
  static createUserRecipient(user: User): NotificationRecipient {
    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      name: user.getFullName(),
    };
  }
  static createInternalRecipient(
    id: string,
    email: string,
    phone: string = '',
    name: string,
  ): NotificationRecipient {
    return { id, email, phone, name };
  }
  static createLogisticsDepartment(): NotificationRecipient {
    return this.createInternalRecipient(
      'logistics-department',
      'logistics@rentacamera.ru',
      '',
      'Логистический отдел',
    );
  }
}
