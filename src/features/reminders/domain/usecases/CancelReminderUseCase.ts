import { isLeft, left, right, type Either } from '../../../../core/errors/Either';
import type { Failure } from '../../../../core/errors/Failure';
import type { Reminder } from '../entities/Reminder';
import type { ReminderRepository } from '../repositories/ReminderRepository';
import type { NotificationScheduler } from '../services/NotificationScheduler';

/**
 * Caso de uso: cancelar un recordatorio (inactiva y elimina las alarmas
 * programadas en el sistema operativo).
 */
export class CancelReminderUseCase {
  constructor(
    private readonly reminderRepository: ReminderRepository,
    private readonly notificationScheduler: NotificationScheduler,
  ) {}

  async execute(
    reminderId: string,
  ): Promise<Either<Failure, Reminder | null>> {
    const cancelResult = await this.notificationScheduler.cancelReminder(
      reminderId,
    );
    if (isLeft(cancelResult)) {
      return left(cancelResult.value);
    }

    const result = await this.reminderRepository.setActive(reminderId, false);
    if (isLeft(result)) {
      return left(result.value);
    }
    return right(result.value);
  }
}