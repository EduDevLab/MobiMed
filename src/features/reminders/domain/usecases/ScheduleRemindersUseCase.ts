import { isLeft, left, right, type Either } from '../../../../core/errors/Either';
import type { Failure } from '../../../../core/errors/Failure';
import type { Reminder } from '../entities/Reminder';
import type { ReminderRepository } from '../repositories/ReminderRepository';
import type { NotificationScheduler } from '../services/NotificationScheduler';

/**
 * Caso de uso: programar las alarmas de un recordatorio existente.
 * (Se usa cuando se reactiva un recordatorio o se re-programa.)
 */
export class ScheduleRemindersUseCase {
  constructor(
    private readonly reminderRepository: ReminderRepository,
    private readonly notificationScheduler: NotificationScheduler,
  ) {}

  async execute(
    reminder: Reminder,
    medicineName: string,
  ): Promise<Either<Failure, Reminder>> {
    if (!reminder.isActive) {
      return right(reminder);
    }

    const scheduleResult = await this.notificationScheduler.schedule(
      reminder,
      medicineName,
    );
    if (isLeft(scheduleResult)) {
      return left(scheduleResult.value);
    }

    const setResult = await this.reminderRepository.setActive(
      reminder.id,
      true,
    );
    if (isLeft(setResult)) {
      return left(setResult.value);
    }

    return right(reminder);
  }
}