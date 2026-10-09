import { isLeft, left, right, type Either } from '../../../../core/errors/Either';
import type { Failure } from '../../../../core/errors/Failure';
import type { Medicine } from '../entities/Medicine';
import type { MedicineRepository } from '../repositories/MedicineRepository';

/** Caso de uso: listar todos los medicamentos registrados. */
export class GetMedicinesUseCase {
  constructor(private readonly medicineRepository: MedicineRepository) {}

  async execute(): Promise<Either<Failure, Medicine[]>> {
    const result = await this.medicineRepository.findAll();
    if (isLeft(result)) {
      return left(result.value);
    }
    return right(result.value);
  }
}