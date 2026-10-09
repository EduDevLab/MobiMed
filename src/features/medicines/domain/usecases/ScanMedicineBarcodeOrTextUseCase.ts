import { left, right, type Either } from '../../../../core/errors/Either';
import { Failure, OcrFailure } from '../../../../core/errors/Failure';
import { extractMedicineInfo } from '../../../../core/utils/medicineExtractor';
import type { OcrDataSource } from '../../data/datasources/OcrDataSource';
import type { MedicinePresentation } from '../entities/Medicine';

/** Medicamento pre-llenado a partir del escaneo OCR. */
export interface ScannedMedicine {
  name: string;
  dosage: string;
  presentation: MedicinePresentation;
  photoPath: string | null;
}

/**
 * Caso de uso 1: `ScanMedicineBarcodeOrTextUseCase`
 *
 * Entrada:  Imagen cruda desde la cámara (ruta local).
 * Proceso:  OCR con ML Kit + extracción de palabras clave con regex.
 * Salida:   Objeto `Medicine` pre-llenado para confirmación del usuario.
 */
export class ScanMedicineBarcodeOrTextUseCase {
  constructor(
    private readonly ocrDataSource: OcrDataSource,
    private readonly extractor: (text: string) => {
      name: string;
      dosage: string;
      presentation: MedicinePresentation;
    } = extractMedicineInfo,
  ) {}

  async execute(imagePath: string): Promise<Either<Failure, ScannedMedicine>> {
    if (!imagePath) {
      return left(new Failure('No se recibió ninguna imagen para escanear.'));
    }

    let text: string;
    try {
      text = await this.ocrDataSource.recognizeText(imagePath);
    } catch (error) {
      if (error instanceof OcrFailure) {
        return left(error);
      }
      return left(new OcrFailure('No se pudo procesar la imagen.', error));
    }

    const trimmed = text.trim();
    if (!trimmed) {
      return left(new OcrFailure('No se detectó texto en la imagen. Inténtalo de nuevo con mejor iluminación.'));
    }

    const extracted = this.extractor(trimmed);
    return right({
      name: extracted.name,
      dosage: extracted.dosage,
      presentation: extracted.presentation,
      photoPath: imagePath,
    });
  }
}