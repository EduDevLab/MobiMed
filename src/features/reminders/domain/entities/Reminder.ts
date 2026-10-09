/** Entidad persistida de un recordatorio (frecuencia por intervalo). */
export interface Reminder {
  id: string;
  medicineId: string;
  /** ISO local de la primera toma, ej. "2026-10-08T08:00". */
  startDatetime: string;
  /** Cada cuántos minutos se repite la toma (480 = 8 h, 270 = 4 h 30 min). */
  intervalMinutes: number;
  /** Días de la semana activos (0=Domingo..6=Sábado). */
  frequencyDays: number[];
  /** Fecha de fin opcional (YYYY-MM-DD). */
  endDate: string | null;
  isActive: boolean;
}