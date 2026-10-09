import type { Either } from '../../../../core/errors/Either';
import type { Failure } from '../../../../core/errors/Failure';
import type { Reminder } from '../entities/Reminder';

/** Contrato del repositorio de recordatorios (persistencia local). */
export interface ReminderRepository {
  create(reminder: Reminder): Promise<Either<Failure, Reminder>>;
  findByMedicine(
    medicineId: string,
  ): Promise<Either<Failure, Reminder[]>>;
  remove(reminderId: string): Promise<Either<Failure, void>>;
  /** Marca un recordatorio como activo/inactivo. */
  setActive(
    reminderId: string,
    isActive: boolean,
  ): Promise<Either<Failure, Reminder | null>>;
}