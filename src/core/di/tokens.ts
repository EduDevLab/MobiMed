import { createToken, type Token } from './Container';
import type { MedicineRepository } from '../../features/medicines/domain/repositories/MedicineRepository';
import type { MedicineLocalDataSource } from '../../features/medicines/data/datasources/MedicineLocalDataSource';
import type { OcrDataSource } from '../../features/medicines/data/datasources/OcrDataSource';
import type { ReminderRepository } from '../../features/reminders/domain/repositories/ReminderRepository';
import type { ReminderLocalDataSource } from '../../features/reminders/data/datasources/ReminderLocalDataSource';
import type { NotificationScheduler } from '../../features/reminders/domain/services/NotificationScheduler';
import type { ScanMedicineBarcodeOrTextUseCase } from '../../features/medicines/domain/usecases/ScanMedicineBarcodeOrTextUseCase';
import type { SaveMedicineAndScheduleRemindersUseCase } from '../../features/medicines/domain/usecases/SaveMedicineAndScheduleRemindersUseCase';
import type { CreateMedicineUseCase } from '../../features/medicines/domain/usecases/CreateMedicineUseCase';
import type { GetMedicinesUseCase } from '../../features/medicines/domain/usecases/GetMedicinesUseCase';
import type { RemoveMedicineUseCase } from '../../features/medicines/domain/usecases/RemoveMedicineUseCase';
import type { CancelReminderUseCase } from '../../features/reminders/domain/usecases/CancelReminderUseCase';
import type { ScheduleRemindersUseCase } from '../../features/reminders/domain/usecases/ScheduleRemindersUseCase';
import type { GetRemindersForMedicineUseCase } from '../../features/reminders/domain/usecases/GetRemindersForMedicineUseCase';

export const TMedicineLocalDataSource = createToken<MedicineLocalDataSource>(
  'MedicineLocalDataSource',
);
export const TReminderLocalDataSource = createToken<ReminderLocalDataSource>(
  'ReminderLocalDataSource',
);
export const TMedicineRepository = createToken<MedicineRepository>(
  'MedicineRepository',
);
export const TReminderRepository = createToken<ReminderRepository>(
  'ReminderRepository',
);
export const TOcrDataSource = createToken<OcrDataSource>('OcrDataSource');
export const TNotificationScheduler = createToken<NotificationScheduler>(
  'NotificationScheduler',
);

export const TScanMedicineUseCase = createToken<ScanMedicineBarcodeOrTextUseCase>(
  'ScanMedicineUseCase',
);
export const TSaveMedicineAndScheduleUseCase =
  createToken<SaveMedicineAndScheduleRemindersUseCase>(
    'SaveMedicineAndScheduleRemindersUseCase',
  );
export const TCreateMedicineUseCase = createToken<CreateMedicineUseCase>(
  'CreateMedicineUseCase',
);
export const TGetMedicinesUseCase = createToken<GetMedicinesUseCase>(
  'GetMedicinesUseCase',
);
export const TRemoveMedicineUseCase = createToken<RemoveMedicineUseCase>(
  'RemoveMedicineUseCase',
);
export const TCancelReminderUseCase = createToken<CancelReminderUseCase>(
  'CancelReminderUseCase',
);
export const TScheduleRemindersUseCase = createToken<ScheduleRemindersUseCase>(
  'ScheduleRemindersUseCase',
);
export const TGetRemindersForMedicineUseCase =
  createToken<GetRemindersForMedicineUseCase>(
    'GetRemindersForMedicineUseCase',
  );

export type Tokens =
  | Token<MedicineLocalDataSource>
  | Token<ReminderLocalDataSource>
  | Token<MedicineRepository>
  | Token<ReminderRepository>
  | Token<OcrDataSource>
  | Token<NotificationScheduler>
  | Token<ScanMedicineBarcodeOrTextUseCase>
  | Token<SaveMedicineAndScheduleRemindersUseCase>
  | Token<CreateMedicineUseCase>
  | Token<GetMedicinesUseCase>
  | Token<RemoveMedicineUseCase>
  | Token<CancelReminderUseCase>
  | Token<ScheduleRemindersUseCase>
  | Token<GetRemindersForMedicineUseCase>;