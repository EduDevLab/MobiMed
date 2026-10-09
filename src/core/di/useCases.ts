import { container } from './Container';
import {
  TCancelReminderUseCase,
  TCreateMedicineUseCase,
  TGetMedicinesUseCase,
  TGetRemindersForMedicineUseCase,
  TNotificationScheduler,
  TRemoveMedicineUseCase,
  TSaveMedicineAndScheduleUseCase,
  TScanMedicineUseCase,
  TScheduleRemindersUseCase,
} from './tokens';
import type { ScanMedicineBarcodeOrTextUseCase } from '../../features/medicines/domain/usecases/ScanMedicineBarcodeOrTextUseCase';
import type { SaveMedicineAndScheduleRemindersUseCase } from '../../features/medicines/domain/usecases/SaveMedicineAndScheduleRemindersUseCase';
import type { CreateMedicineUseCase } from '../../features/medicines/domain/usecases/CreateMedicineUseCase';
import type { GetMedicinesUseCase } from '../../features/medicines/domain/usecases/GetMedicinesUseCase';
import type { RemoveMedicineUseCase } from '../../features/medicines/domain/usecases/RemoveMedicineUseCase';
import type { CancelReminderUseCase } from '../../features/reminders/domain/usecases/CancelReminderUseCase';
import type { ScheduleRemindersUseCase } from '../../features/reminders/domain/usecases/ScheduleRemindersUseCase';
import type { GetRemindersForMedicineUseCase } from '../../features/reminders/domain/usecases/GetRemindersForMedicineUseCase';
import type { NotificationScheduler } from '../../features/reminders/domain/services/NotificationScheduler';

/** Accesores tipados a los casos de uso (usados por UI y thunks). */
export const getScanMedicineUseCase = (): ScanMedicineBarcodeOrTextUseCase =>
  container.resolve(TScanMedicineUseCase);
export const getSaveMedicineAndScheduleUseCase =
  (): SaveMedicineAndScheduleRemindersUseCase =>
    container.resolve(TSaveMedicineAndScheduleUseCase);
export const getCreateMedicineUseCase = (): CreateMedicineUseCase =>
  container.resolve(TCreateMedicineUseCase);
export const getMedicinesUseCase = (): GetMedicinesUseCase =>
  container.resolve(TGetMedicinesUseCase);
export const getRemoveMedicineUseCase = (): RemoveMedicineUseCase =>
  container.resolve(TRemoveMedicineUseCase);
export const getCancelReminderUseCase = (): CancelReminderUseCase =>
  container.resolve(TCancelReminderUseCase);
export const getScheduleRemindersUseCase = (): ScheduleRemindersUseCase =>
  container.resolve(TScheduleRemindersUseCase);
export const getRemindersForMedicineUseCase =
  (): GetRemindersForMedicineUseCase =>
    container.resolve(TGetRemindersForMedicineUseCase);
export const getNotificationScheduler = (): NotificationScheduler =>
  container.resolve(TNotificationScheduler);