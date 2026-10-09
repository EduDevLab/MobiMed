import type { Either } from '../../../../core/errors/Either';
import type { Failure } from '../../../../core/errors/Failure';
import type { Medicine } from '../entities/Medicine';

/**
 * Contrato del repositorio de medicamentos.
 * La implementación vive en la capa de datos; el dominio solo conoce esta interfaz.
 */
export interface MedicineRepository {
  save(medicine: Medicine): Promise<Either<Failure, Medicine>>;
  findAll(): Promise<Either<Failure, Medicine[]>>;
  findById(id: string): Promise<Either<Failure, Medicine | null>>;
  remove(id: string): Promise<Either<Failure, void>>;
}