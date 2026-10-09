import { openDatabase } from '../db/Database';
import { container } from './Container';
import {
  TCreateMedicineUseCase,
  TCancelReminderUseCase,
  TGetMedicinesUseCase,
  TGetRemindersForMedicineUseCase,
  TMedicineLocalDataSource,
  TMedicineRepository,
  TNotificationScheduler,
  TOcrDataSource,
  TReminderLocalDataSource,
  TReminderRepository,
  TRemoveMedicineUseCase,
  TSaveMedicineAndScheduleUseCase,
  TScanMedicineUseCase,
  TScheduleRemindersUseCase,
} from './tokens';
import { MedicineLocalDataSource } from '../../features/medicines/data/datasources/MedicineLocalDataSource';
import { ReminderLocalDataSource } from '../../features/reminders/data/datasources/ReminderLocalDataSource';
import { MedicineRepositoryImpl } from '../../features/medicines/data/repositories/MedicineRepositoryImpl';
import { ReminderRepositoryImpl } from '../../features/reminders/data/repositories/ReminderRepositoryImpl';
import { TextRecognitionOcrDataSource } from '../../features/medicines/data/datasources/TextRecognitionOcrDataSource';
import { NotifeeNotificationScheduler } from '../../features/reminders/data/services/NotifeeNotificationScheduler';
import { ScanMedicineBarcodeOrTextUseCase } from '../../features/medicines/domain/usecases/ScanMedicineBarcodeOrTextUseCase';
import { SaveMedicineAndScheduleRemindersUseCase } from '../../features/medicines/domain/usecases/SaveMedicineAndScheduleRemindersUseCase';
import { CreateMedicineUseCase } from '../../features/medicines/domain/usecases/CreateMedicineUseCase';
import { GetMedicinesUseCase } from '../../features/medicines/domain/usecases/GetMedicinesUseCase';
import { RemoveMedicineUseCase } from '../../features/medicines/domain/usecases/RemoveMedicineUseCase';
import { CancelReminderUseCase } from '../../features/reminders/domain/usecases/CancelReminderUseCase';
import { ScheduleRemindersUseCase } from '../../features/reminders/domain/usecases/ScheduleRemindersUseCase';
import { GetRemindersForMedicineUseCase } from '../../features/reminders/domain/usecases/GetRemindersForMedicineUseCase';

let initialized = false;

/**
 * Punto de composición raíz: registra todas las dependencias
 * (datasources, repositorios, servicios y casos de uso) en el contenedor.
 */
export function initializeDependencies(): void {
  if (initialized) {
    return;
  }
  initialized = true;

  const db = openDatabase();

  container.register(TMedicineLocalDataSource, () => new MedicineLocalDataSource(db));
  container.register(TReminderLocalDataSource, () => new ReminderLocalDataSource(db));

  container.register(
    TMedicineRepository,
    () => new MedicineRepositoryImpl(container.resolve(TMedicineLocalDataSource)),
  );
  container.register(
    TReminderRepository,
    () => new ReminderRepositoryImpl(container.resolve(TReminderLocalDataSource)),
  );
  container.register(TOcrDataSource, () => new TextRecognitionOcrDataSource());
  container.register(
    TNotificationScheduler,
    () => new NotifeeNotificationScheduler(),
  );

  container.register(
    TScanMedicineUseCase,
    () => new ScanMedicineBarcodeOrTextUseCase(container.resolve(TOcrDataSource)),
  );
  container.register(
    TSaveMedicineAndScheduleUseCase,
    () =>
      new SaveMedicineAndScheduleRemindersUseCase(
        container.resolve(TMedicineRepository),
        container.resolve(TReminderRepository),
        container.resolve(TNotificationScheduler),
      ),
  );
  container.register(
    TCreateMedicineUseCase,
    () => new CreateMedicineUseCase(container.resolve(TMedicineRepository)),
  );
  container.register(
    TGetMedicinesUseCase,
    () => new GetMedicinesUseCase(container.resolve(TMedicineRepository)),
  );
  container.register(
    TRemoveMedicineUseCase,
    () =>
      new RemoveMedicineUseCase(
        container.resolve(TMedicineRepository),
        container.resolve(TReminderRepository),
        container.resolve(TNotificationScheduler),
      ),
  );
  container.register(
    TCancelReminderUseCase,
    () =>
      new CancelReminderUseCase(
        container.resolve(TReminderRepository),
        container.resolve(TNotificationScheduler),
      ),
  );
  container.register(
    TScheduleRemindersUseCase,
    () =>
      new ScheduleRemindersUseCase(
        container.resolve(TReminderRepository),
        container.resolve(TNotificationScheduler),
      ),
  );
  container.register(
    TGetRemindersForMedicineUseCase,
    () =>
      new GetRemindersForMedicineUseCase(container.resolve(TReminderRepository)),
  );
}