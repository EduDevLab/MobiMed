import { isLeft, left, right, type Either } from '../../../../core/errors/Either';
import type { Failure } from '../../../../core/errors/Failure';
import type { ReminderRepository } from '../../../reminders/domain/repositories/ReminderRepository';
import type { NotificationScheduler } from '../../../reminders/domain/services/NotificationScheduler';
import type { MedicineRepository } from '../repositories/MedicineRepository';

/**
 * Caso de uso: eliminar un medicamento y sus recordatorios,
 * cancelando las alarmas programadas en el sistema.
 */
export class RemoveMedicineUseCase {
  constructor(
    private readonly medicineRepository: MedicineRepository,
    private readonly reminderRepository: ReminderRepository,
    private readonly notificationScheduler: NotificationScheduler,
  ) {}

  async execute(
    medicineId: string,
  ): Promise<Either<Failure, void>> {
    // 1) Cancelar alarmas de los recordatorios del medicamento.
    const remindersResult = await this.reminderRepository.findByMedicine(
      medicineId,
    );
    if (isLeft(remindersResult)) {
      return left(remindersResult.value);
    }
    for (const reminder of remindersResult.value) {
      const cancel = await this.notificationScheduler.cancelReminder(
        reminder.id,
      );
      if (isLeft(cancel)) {
        return left(cancel.value);
      }
    }

    // 2) Eliminar filas (ON DELETE CASCADE borra los recordatorios).
    const removeResult = await this.medicineRepository.remove(medicineId);
    if (isLeft(removeResult)) {
      return left(removeResult.value);
    }

    return right(undefined);
  }
}