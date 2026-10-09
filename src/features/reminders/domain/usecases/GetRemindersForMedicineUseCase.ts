import { isLeft, left, right, type Either } from '../../../../core/errors/Either';
import type { Failure } from '../../../../core/errors/Failure';
import type { Reminder } from '../entities/Reminder';
import type { ReminderRepository } from '../repositories/ReminderRepository';

/** Caso de uso: obtener los recordatorios de un medicamento. */
export class GetRemindersForMedicineUseCase {
  constructor(private readonly reminderRepository: ReminderRepository) {}

  async execute(
    medicineId: string,
  ): Promise<Either<Failure, Reminder[]>> {
    const result = await this.reminderRepository.findByMedicine(medicineId);
    if (isLeft(result)) {
      return left(result.value);
    }
    return right(result.value);
  }
}