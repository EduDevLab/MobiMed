import { open, type QuickSQLiteConnection } from 'react-native-quick-sqlite';

const DB_NAME = 'mobimed.db';

let connection: QuickSQLiteConnection | null = null;

const CREATE_MEDICINES_TABLE = `
  CREATE TABLE IF NOT EXISTS medicines (
    id          TEXT PRIMARY KEY NOT NULL,
    name        TEXT NOT NULL,
    dosage      TEXT NOT NULL,
    presentation TEXT NOT NULL,
    photo_path  TEXT,
    created_at  TEXT NOT NULL
  )`;

/**
 * v3: granularidad en minutos.
 * Hereda de v2 (se eliminó `time_slots` y se agregó `start_datetime`):
 *   - start_datetime: ISO local de la primera toma
 *   - interval_minutes: cada cuántos minutos se repite (ej. 270 = 4 h 30 min)
 */
const CREATE_REMINDERS_TABLE = `
  CREATE TABLE IF NOT EXISTS reminders (
    id              TEXT PRIMARY KEY NOT NULL,
    medicine_id     TEXT NOT NULL,
    start_datetime  TEXT NOT NULL,
    interval_minutes INTEGER NOT NULL,
    frequency_days  TEXT NOT NULL,
    end_date        TEXT,
    is_active       INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE
  )`;

const CREATE_MEDICINE_INDEX = `
  CREATE INDEX IF NOT EXISTS idx_medicines_created_at ON medicines(created_at)`;

const CREATE_REMINDER_INDEX = `
  CREATE INDEX IF NOT EXISTS idx_reminders_medicine_id ON reminders(medicine_id)`;

/**
 * Abre (y devuelve) la conexión a la base de datos local,
 * ejecutando las migraciones pendientes de forma incremental.
 */
export function openDatabase(): QuickSQLiteConnection {
  if (connection) {
    return connection;
  }

  const db = open({ name: DB_NAME });

  const versionResult = db.execute('PRAGMA user_version');
  let version: number = versionResult.rows?._array?.[0]?.user_version ?? 0;

  if (version < 1) {
    db.executeBatch([
      [CREATE_MEDICINES_TABLE],
      [CREATE_MEDICINE_INDEX],
      ['PRAGMA user_version = 1'],
    ]);
    version = 1;
  }

  if (version < 2) {
    // App pre-release: se reconstruye la tabla (el esquema anterior
    // con `time_slots` deja de ser soportado).
    db.executeBatch([
      ['DROP TABLE IF EXISTS reminders'],
      [CREATE_REMINDERS_TABLE],
      [CREATE_REMINDER_INDEX],
      ['PRAGMA user_version = 2'],
    ]);
    version = 2;
  }

  if (version < 3) {
    // v2 → v3: `interval_hours` por `interval_minutes`.
    // Se conservan los datos existentes convirtiendo las horas a minutos (* 60).
    db.executeBatch([
      ['ALTER TABLE reminders RENAME TO reminders_legacy'],
      [CREATE_REMINDERS_TABLE],
      [
        `INSERT INTO reminders
           (id, medicine_id, start_datetime, interval_minutes, frequency_days, end_date, is_active)
         SELECT id, medicine_id, start_datetime, interval_hours * 60,
                frequency_days, end_date, is_active
         FROM reminders_legacy`,
      ],
      ['DROP TABLE reminders_legacy'],
      ['PRAGMA user_version = 3'],
    ]);
    version = 3;
  }

  connection = db;
  return connection;
}

/** Cierra la conexión (útil en pruebas). */
export function closeDatabase(): void {
  if (connection) {
    connection.close();
    connection = null;
  }
}