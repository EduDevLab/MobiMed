import { generateId } from '../../../../core/utils/ids';
import {
  isLeft,
  left,
  right,
  type Either,
} from '../../../../core/errors/Either';
import type { Failure } from '../../../../core/errors/Failure';
import type { Medicine } from '../entities/Medicine';
import type { MedicineRepository } from '../repositories/MedicineRepository';
import type { Reminder } from '../../../reminders/domain/entities/Reminder';
import type { ReminderDraft } from '../../../reminders/domain/entities/ReminderDraft';
import type { ReminderRepository } from '../../../reminders/domain/repositories/ReminderRepository';
import type { NotificationScheduler } from '../../../reminders/domain/services/NotificationScheduler';

export interface SaveMedicineAndScheduleRemindersParams {
  /** Datos del medicamento sin identidad. */
  medicine: Omit<Medicine, 'id' | 'createdAt'>;
  /** Reglas de programación de recordatorios. */
  reminder: ReminderDraft;
}

/** Resultado de la operación de guardado. */
export interface SavedMedicineResult {
  medicine: Medicine;
  reminderId: string | null;
}

/**
 * Caso de uso 2: `SaveMedicineAndScheduleRemindersUseCase`
 *
 * Entrada:  Objeto `Medicine` y reglas de programación (`Reminders`).
 * Proceso:  Inserta en la base de datos local y registra alarmas nativas
 *           en el sistema operativo mediante el servicio de notificaciones.
 * Salida:   Confirmación de éxito (`Either<Failure, Unit>`).
 */
export class SaveMedicineAndScheduleRemindersUseCase {
  constructor(
    private readonly medicineRepository: MedicineRepository,
    private readonly reminderRepository: ReminderRepository,
    private readonly notificationScheduler: NotificationScheduler,
  ) {}

  async execute(
    params: SaveMedicineAndScheduleRemindersParams,
  ): Promise<Either<Failure, SavedMedicineResult>> {
    const nowIso = new Date().toISOString();
    const medicine: Medicine = {
      ...params.medicine,
      id: generateId(),
      createdAt: nowIso,
    };

    // 1) Persistir el medicamento.
    const medicineResult = await this.medicineRepository.save(medicine);
    if (isLeft(medicineResult)) {
      return left(medicineResult.value);
    }

    const reminder: Reminder = {
      id: generateId(),
      medicineId: medicine.id,
      startDatetime: params.reminder.startDatetime,
      intervalMinutes: params.reminder.intervalMinutes,
      frequencyDays: params.reminder.frequencyDays,
      endDate: params.reminder.endDate,
      isActive: true,
    };

    // 2) Persistir el recordatorio.
    const reminderResult = await this.reminderRepository.create(reminder);
    if (isLeft(reminderResult)) {
      return left(reminderResult.value);
    }

    // 3) Programar alarmas nativas exactas.
    const scheduleResult = await this.notificationScheduler.schedule(
      reminder,
      medicine.name,
    );
    if (isLeft(scheduleResult)) {
      return left(scheduleResult.value);
    }

    return right({ medicine, reminderId: reminder.id });
  }
}