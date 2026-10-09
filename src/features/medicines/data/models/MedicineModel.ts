import type {
  Medicine,
  MedicinePresentation,
} from '../../domain/entities/Medicine';
import { MEDICINE_PRESENTATIONS } from '../../domain/entities/Medicine';

/** Fila tal como se almacena en SQLite. */
export interface MedicineRow {
  id: string;
  name: string;
  dosage: string;
  presentation: string;
  photo_path: string | null;
  created_at: string;
}

function toMedicinePresentation(value: string): MedicinePresentation {
  return MEDICINE_PRESENTATIONS.includes(value as MedicinePresentation)
    ? (value as MedicinePresentation)
    : 'Otro';
}

/** Mapeador entre la entidad de dominio y la fila de la base de datos. */
export const MedicineModel = {
  fromDomain(medicine: Medicine): MedicineRow {
    return {
      id: medicine.id,
      name: medicine.name,
      dosage: medicine.dosage,
      presentation: medicine.presentation,
      photo_path: medicine.photoPath,
      created_at: medicine.createdAt,
    };
  },

  toDomain(row: MedicineRow): Medicine {
    return {
      id: row.id,
      name: row.name,
      dosage: row.dosage,
      presentation: toMedicinePresentation(row.presentation),
      photoPath: row.photo_path ?? null,
      createdAt: row.created_at,
    };
  },
};