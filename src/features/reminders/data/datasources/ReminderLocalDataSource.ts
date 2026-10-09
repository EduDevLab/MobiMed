import type { QuickSQLiteConnection } from 'react-native-quick-sqlite';
import { DatabaseFailure } from '../../../../core/errors/Failure';
import type { Reminder } from '../../domain/entities/Reminder';
import { ReminderModel, type ReminderRow } from '../models/ReminderModel';

function mapRow(row: ReminderRow): Reminder | null {
  return row ? ReminderModel.toDomain(row) : null;
}

/** Datasource local: acceso SQL a la tabla `reminders` (esquema v3). */
export class ReminderLocalDataSource {
  private readonly table = 'reminders';

  constructor(private readonly db: QuickSQLiteConnection) {}

  async insert(reminder: Reminder): Promise<Reminder> {
    const row = ReminderModel.fromDomain(reminder);
    const result = await this.db.executeAsync(
      `INSERT INTO ${this.table}
        (id, medicine_id, start_datetime, interval_minutes, frequency_days, end_date, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        row.id,
        row.medicine_id,
        row.start_datetime,
        row.interval_minutes,
        row.frequency_days,
        row.end_date,
        row.is_active,
      ],
    );
    if (result.rowsAffected === 0) {
      throw new DatabaseFailure('No se pudo insertar el recordatorio.');
    }
    return reminder;
  }

  async findByMedicine(medicineId: string): Promise<Reminder[]> {
    const result = await this.db.executeAsync(
      `SELECT * FROM ${this.table} WHERE medicine_id = ? ORDER BY start_datetime`,
      [medicineId],
    );
    const rows = (result.rows?._array ?? []) as ReminderRow[];
    return rows.map(row => ReminderModel.toDomain(row));
  }

  async setActive(
    reminderId: string,
    isActive: boolean,
  ): Promise<Reminder | null> {
    const result = await this.db.executeAsync(
      `UPDATE ${this.table} SET is_active = ? WHERE id = ?`,
      [isActive ? 1 : 0, reminderId],
    );
    if (result.rowsAffected === 0) {
      throw new DatabaseFailure('El recordatorio no existe.');
    }
    const read = await this.db.executeAsync(
      `SELECT * FROM ${this.table} WHERE id = ? LIMIT 1`,
      [reminderId],
    );
    const rows = (read.rows?._array ?? []) as ReminderRow[];
    return mapRow(rows[0]);
  }

  async remove(reminderId: string): Promise<void> {
    const result = await this.db.executeAsync(
      `DELETE FROM ${this.table} WHERE id = ?`,
      [reminderId],
    );
    if (result.rowsAffected === 0) {
      throw new DatabaseFailure('El recordatorio no existe.');
    }
  }
}