import {
  left,
  right,
  type Either,
} from '../../../../core/errors/Either';
import { DatabaseFailure, Failure } from '../../../../core/errors/Failure';
import type { Medicine } from '../../domain/entities/Medicine';
import type { MedicineRepository } from '../../domain/repositories/MedicineRepository';
import type { MedicineLocalDataSource } from '../datasources/MedicineLocalDataSource';

/** Implementación del repositorio de medicamentos sobre SQLite. */
export class MedicineRepositoryImpl implements MedicineRepository {
  constructor(private readonly localDataSource: MedicineLocalDataSource) {}

  async save(medicine: Medicine): Promise<Either<Failure, Medicine>> {
    try {
      await this.localDataSource.insert(medicine);
      return right(medicine);
    } catch (error) {
      return left(this.toFailure(error));
    }
  }

  async findAll(): Promise<Either<Failure, Medicine[]>> {
    try {
      const medicines = await this.localDataSource.findAll();
      return right(medicines);
    } catch (error) {
      return left(this.toFailure(error));
    }
  }

  async findById(id: string): Promise<Either<Failure, Medicine | null>> {
    try {
      const medicine = await this.localDataSource.findById(id);
      return right(medicine);
    } catch (error) {
      return left(this.toFailure(error));
    }
  }

  async remove(id: string): Promise<Either<Failure, void>> {
    try {
      await this.localDataSource.remove(id);
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
      'Error de base de datos al operar con medicamentos.',
      error,
    );
  }
}