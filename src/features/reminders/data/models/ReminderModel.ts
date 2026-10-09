import type { Reminder } from '../../domain/entities/Reminder';

/**
 * Fila tal como se almacena en SQLite (esquema v3: `interval_minutes`).
 */
export interface ReminderRow {
  id: string;
  medicine_id: string;
  /** ISO local de la primera toma, ej. "2026-10-08T08:00". */
  start_datetime: string;
  /** Cada cuántos minutos se repite la toma (480 = 8 h, 270 = 4 h 30 min). */
  interval_minutes: number;
  /** JSON de `number[]` (0..6). */
  frequency_days: string;
  end_date: string | null;
  /** 1 = activo, 0 = inactivo. */
  is_active: number;
}

function safeJsonParse<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** Mapeador entre la entidad de dominio y la fila de la base de datos. */
export const ReminderModel = {
  fromDomain(reminder: Reminder): ReminderRow {
    return {
      id: reminder.id,
      medicine_id: reminder.medicineId,
      start_datetime: reminder.startDatetime,
      interval_minutes: reminder.intervalMinutes,
      frequency_days: JSON.stringify(reminder.frequencyDays),
      end_date: reminder.endDate,
      is_active: reminder.isActive ? 1 : 0,
    };
  },

  toDomain(row: ReminderRow): Reminder {
    return {
      id: row.id,
      medicineId: row.medicine_id,
      startDatetime: row.start_datetime,
      intervalMinutes: row.interval_minutes,
      frequencyDays: safeJsonParse<number[]>(row.frequency_days, []),
      endDate: row.end_date ?? null,
      isActive: row.is_active === 1,
    };
  },
};