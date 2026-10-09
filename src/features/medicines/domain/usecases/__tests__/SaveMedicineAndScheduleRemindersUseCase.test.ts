import { SaveMedicineAndScheduleRemindersUseCase } from '../SaveMedicineAndScheduleRemindersUseCase';
import type { MedicineRepository } from '../../repositories/MedicineRepository';
import type { ReminderRepository } from '../../../../reminders/domain/repositories/ReminderRepository';
import type { NotificationScheduler } from '../../../../reminders/domain/services/NotificationScheduler';
import type { Medicine } from '../../entities/Medicine';
import type { Reminder } from '../../../../reminders/domain/entities/Reminder';
import { isLeft, isRight, left, right } from '../../../../../core/errors/Either';
import type { Either } from '../../../../../core/errors/Either';
import { DatabaseFailure, type Failure } from '../../../../../core/errors/Failure';

const dbError = <T>(message: string): Either<Failure, T> =>
  left(new DatabaseFailure(message));

describe('SaveMedicineAndScheduleRemindersUseCase', () => {
  const medicineInput = {
    name: 'Amoxicilina',
    dosage: '500 mg',
    presentation: 'Pastilla' as const,
    photoPath: null,
  };

  const reminderInput = {
    startDatetime: '2026-10-08T08:00',
    intervalMinutes: 8 * 60,
    frequencyDays: [1, 3, 5],
    endDate: null,
  };

  interface Mocks {
    savedMedicines: Medicine[];
    savedReminders: Reminder[];
    medicineRepository: MedicineRepository;
    reminderRepository: ReminderRepository;
    notificationScheduler: NotificationScheduler;
  }

  const buildMocks = (overrides?: {
    schedule?: Either<Failure, void>;
    saveMedicine?: Either<Failure, Medicine>;
  }): Mocks => {
    const savedMedicines: Medicine[] = [];
    const savedReminders: Reminder[] = [];

    const medicineRepository: MedicineRepository = {
      save: jest.fn(
        async (medicine: Medicine): Promise<Either<Failure, Medicine>> => {
          if (overrides?.saveMedicine) {
            return overrides.saveMedicine;
          }
          savedMedicines.push(medicine);
          return right(medicine);
        },
      ),
      findAll: jest.fn(async (): Promise<Either<Failure, Medicine[]>> => right(savedMedicines)),
      findById: jest.fn(
        async (): Promise<Either<Failure, Medicine | null>> =>
          right(savedMedicines[0] ?? null),
      ),
      remove: jest.fn(async (): Promise<Either<Failure, void>> => right(undefined)),
    };

    const reminderRepository: ReminderRepository = {
      create: jest.fn(
        async (reminder: Reminder): Promise<Either<Failure, Reminder>> => {
          savedReminders.push(reminder);
          return right(reminder);
        },
      ),
      findByMedicine: jest.fn(
        async (): Promise<Either<Failure, Reminder[]>> => right(savedReminders),
      ),
      setActive: jest.fn(
        async (): Promise<Either<Failure, Reminder | null>> => right(null),
      ),
      remove: jest.fn(async (): Promise<Either<Failure, void>> => right(undefined)),
    };

    const notificationScheduler: NotificationScheduler = {
      requestPermissions: jest.fn(async (): Promise<Either<Failure, void>> => right(undefined)),
      schedule: jest.fn(
        async (): Promise<Either<Failure, void>> =>
          overrides?.schedule ?? right(undefined),
      ),
      cancelReminder: jest.fn(async (): Promise<Either<Failure, void>> => right(undefined)),
    };

    return {
      savedMedicines,
      savedReminders,
      medicineRepository,
      reminderRepository,
      notificationScheduler,
    };
  };

  it('persiste el medicamento y el recordatorio y programa las alarmas', async () => {
    const mocks = buildMocks();
    const useCase = new SaveMedicineAndScheduleRemindersUseCase(
      mocks.medicineRepository,
      mocks.reminderRepository,
      mocks.notificationScheduler,
    );

    const result = await useCase.execute({
      medicine: medicineInput,
      reminder: reminderInput,
    });

    expect(isRight(result)).toBe(true);
    const savedMedicine = isRight(result) ? result.value.medicine : null;
    expect(savedMedicine?.id).toBeDefined();
    expect(savedMedicine?.createdAt).toBeDefined();
    expect(isRight(result) ? result.value.reminderId : null).toBeDefined();

    // El recordatorio se enlaza con el medicamento y nace activo.
    expect(mocks.savedReminders).toHaveLength(1);
    expect(mocks.savedReminders[0].medicineId).toBe(savedMedicine?.id);
    expect(mocks.savedReminders[0].isActive).toBe(true);
    expect(mocks.savedReminders[0].startDatetime).toBe('2026-10-08T08:00');
    expect(mocks.savedReminders[0].intervalMinutes).toBe(8 * 60);
    expect(mocks.savedReminders[0].frequencyDays).toEqual([1, 3, 5]);

    // Se programaron alarmas nativas con el nombre del medicamento.
    expect(mocks.notificationScheduler.schedule).toHaveBeenCalledTimes(1);
  });

  it('propaga el fallo si no se puede programar la alarma', async () => {
    const mocks = buildMocks({ schedule: dbError('sin permiso de alarmas') });
    const useCase = new SaveMedicineAndScheduleRemindersUseCase(
      mocks.medicineRepository,
      mocks.reminderRepository,
      mocks.notificationScheduler,
    );

    const result = await useCase.execute({
      medicine: medicineInput,
      reminder: reminderInput,
    });

    expect(isLeft(result)).toBe(true);
  });

  it('no programa alarmas si falla el guardado del medicamento', async () => {
    const mocks = buildMocks({ saveMedicine: dbError('db error') });
    const useCase = new SaveMedicineAndScheduleRemindersUseCase(
      mocks.medicineRepository,
      mocks.reminderRepository,
      mocks.notificationScheduler,
    );

    const result = await useCase.execute({
      medicine: medicineInput,
      reminder: reminderInput,
    });

    expect(isLeft(result)).toBe(true);
    expect(mocks.notificationScheduler.schedule).not.toHaveBeenCalled();
    expect(mocks.reminderRepository.create).not.toHaveBeenCalled();
  });
});