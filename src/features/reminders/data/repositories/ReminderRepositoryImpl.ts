import {
  left,
  right,
  type Either,
} from '../../../../core/errors/Either';
import { DatabaseFailure, Failure } from '../../../../core/errors/Failure';
import type { Reminder } from '../../domain/entities/Reminder';
import type { ReminderRepository } from '../../domain/repositories/ReminderRepository';
import type { ReminderLocalDataSource } from '../datasources/ReminderLocalDataSource';

/** Implementación del repositorio de recordatorios sobre SQLite. */
export class ReminderRepositoryImpl implements ReminderRepository {
  constructor(private readonly localDataSource: ReminderLocalDataSource) {}

  async create(reminder: Reminder): Promise<Either<Failure, Reminder>> {
    try {
      await this.localDataSource.insert(reminder);
      return right(reminder);
    } catch (error) {
      return left(this.toFailure(error));
    }
  }

  async findByMedicine(
    medicineId: string,
  ): Promise<Either<Failure, Reminder[]>> {
    try {
      const reminders = await this.localDataSource.findByMedicine(medicineId);
      return right(reminders);
    } catch (error) {
      return left(this.toFailure(error));
    }
  }

  async setActive(
    reminderId: string,
    isActive: boolean,
  ): Promise<Either<Failure, Reminder | null>> {
    try {
      const reminder = await this.localDataSource.setActive(
        reminderId,
        isActive,
      );
      return right(reminder);
    } catch (error) {
      return left(this.toFailure(error));
    }
  }

  async remove(reminderId: string): Promise<Either<Failure, void>> {
    try {
      await this.localDataSource.remove(reminderId);
      return right(undefined);
    } catch (error) {
      return left(this.toFailure(error));
    }
  }

  private toFailure(error: unknown): Failure {
    if (error instanceof Failure) {
      return error;
    }
    return new DatabaseFailure(
      'Error de base de datos al operar con recordatorios.',
      error,
    );
  }
}