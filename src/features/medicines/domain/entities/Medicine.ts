/** Presentaciones soportadas por la app para un medicamento. */
export type MedicinePresentation =
  | 'Pastilla'
  | 'Cápsula'
  | 'Jarabe'
  | 'Inyección'
  | 'Gotas'
  | 'Crema'
  | 'Inhalador'
  | 'Otro';

export const MEDICINE_PRESENTATIONS: readonly MedicinePresentation[] = [
  'Pastilla',
  'Cápsula',
  'Jarabe',
  'Inyección',
  'Gotas',
  'Crema',
  'Inhalador',
  'Otro',
];

/** Entidad pura de negocio de un medicamento. */
export interface Medicine {
  id: string;
  name: string;
  /** Concentración, ej. "500 mg". */
  dosage: string;
  presentation: MedicinePresentation;
  /** Ruta local de la foto de la caja/receta (opcional). */
  photoPath: string | null;
  /** Fecha de registro en formato ISO. */
  createdAt: string;
}

/** Datos de un medicamento antes de asignarle identidad. */
export type NewMedicine = Omit<Medicine, 'id' | 'createdAt'>;