import type { QuickSQLiteConnection } from 'react-native-quick-sqlite';
import { DatabaseFailure } from '../../../../core/errors/Failure';
import type { Medicine } from '../../domain/entities/Medicine';
import { MedicineModel, type MedicineRow } from '../models/MedicineModel';

/** Datasource local: acceso SQL a la tabla `medicines`. */
export class MedicineLocalDataSource {
  private readonly table = 'medicines';

  constructor(private readonly db: QuickSQLiteConnection) {}

  async insert(medicine: Medicine): Promise<Medicine> {
    const row = MedicineModel.fromDomain(medicine);
    const result = await this.db.executeAsync(
      `INSERT INTO ${this.table}
        (id, name, dosage, presentation, photo_path, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        row.id,
        row.name,
        row.dosage,
        row.presentation,
        row.photo_path,
        row.created_at,
      ],
    );
    if (result.rowsAffected === 0) {
      throw new DatabaseFailure('No se pudo insertar el medicamento.');
    }
    return medicine;
  }

  async findAll(): Promise<Medicine[]> {
    const result = await this.db.executeAsync(
      `SELECT * FROM ${this.table} ORDER BY created_at DESC`,
    );
    const rows = (result.rows?._array ?? []) as MedicineRow[];
    return rows.map(row => MedicineModel.toDomain(row));
  }

  async findById(id: string): Promise<Medicine | null> {
    const result = await this.db.executeAsync(
      `SELECT * FROM ${this.table} WHERE id = ? LIMIT 1`,
      [id],
    );
    const rows = (result.rows?._array ?? []) as MedicineRow[];
    const row = rows[0];
    return row ? MedicineModel.toDomain(row) : null;
  }

  async remove(id: string): Promise<void> {
    const result = await this.db.executeAsync(
      `DELETE FROM ${this.table} WHERE id = ?`,
      [id],
    );
    if (result.rowsAffected === 0) {
      throw new DatabaseFailure('El medicamento no existe.');
    }
  }
}