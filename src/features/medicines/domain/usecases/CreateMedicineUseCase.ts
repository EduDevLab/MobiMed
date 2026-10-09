import {
  isLeft,
  left,
  right,
  type Either,
} from '../../../../core/errors/Either';
import type { Failure } from '../../../../core/errors/Failure';
import type { Medicine } from '../entities/Medicine';
import type { MedicineRepository } from '../repositories/MedicineRepository';

/** Caso de uso: registrar un medicamento manualmente (sin recordatorios). */
export class CreateMedicineUseCase {
  constructor(private readonly medicineRepository: MedicineRepository) {}

  async execute(medicine: Medicine): Promise<Either<Failure, Medicine>> {
    const result = await this.medicineRepository.save(medicine);
    if (isLeft(result)) {
      return left(result.value);
    }
    return right(result.value);
  }
}