import type { MedicinePresentation } from '../../features/medicines/domain/entities/Medicine';

/** Datos pre-llenados devueltos por el escaneo OCR. */
export interface ScannedMedicineParams {
  name: string;
  dosage: string;
  presentation: MedicinePresentation;
  photoPath: string | null;
}

export type RootStackParamList = {
  MedicineList: undefined;
  RegisterMedicine: { scanned?: ScannedMedicineParams } | undefined;
  MedicineDetail: { medicineId: string };
  ScanMedicine: undefined;
  ReminderForm: undefined;
  Settings: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}