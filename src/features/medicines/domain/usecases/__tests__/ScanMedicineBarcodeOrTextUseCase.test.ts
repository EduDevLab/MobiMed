import { ScanMedicineBarcodeOrTextUseCase } from '../ScanMedicineBarcodeOrTextUseCase';
import type { OcrDataSource } from '../../../data/datasources/OcrDataSource';
import { isLeft, isRight } from '../../../../../core/errors/Either';
import { OcrFailure } from '../../../../../core/errors/Failure';

describe('ScanMedicineBarcodeOrTextUseCase', () => {
  const createOcrMock = (value: string | Error): OcrDataSource => ({
    recognizeText: jest.fn(async () => {
      if (value instanceof Error) {
        throw value;
      }
      return value;
    }),
  });

  it('devuelve un Medicine pre-llenado a partir del texto OCR', async () => {
    const ocr = createOcrMock(
      'AMOXICILINA\nCápsulas\n500 mg\nAdministrar por vía oral',
    );
    const useCase = new ScanMedicineBarcodeOrTextUseCase(ocr);

    const result = await useCase.execute('/tmp/foto.jpg');

    expect(isRight(result)).toBe(true);
    if (isRight(result)) {
      expect(result.value.name).toBe('Amoxicilina');
      expect(result.value.dosage).toBe('500 mg');
      expect(result.value.presentation).toBe('Cápsula');
      expect(result.value.photoPath).toBe('/tmp/foto.jpg');
    }
    expect(ocr.recognizeText).toHaveBeenCalledWith('/tmp/foto.jpg');
  });

  it('falla con OcrFailure si no hay texto reconocible', async () => {
    const ocr = createOcrMock('   ');
    const useCase = new ScanMedicineBarcodeOrTextUseCase(ocr);

    const result = await useCase.execute('/tmp/foto.jpg');

    expect(isLeft(result)).toBe(true);
    if (isLeft(result)) {
      expect(result.value).toBeInstanceOf(OcrFailure);
    }
  });

  it('propaga los errores de OCR como OcrFailure', async () => {
    const ocr = createOcrMock(new Error('native ocr exploded'));
    const useCase = new ScanMedicineBarcodeOrTextUseCase(ocr);

    const result = await useCase.execute('/tmp/foto.jpg');

    expect(isLeft(result)).toBe(true);
    if (isLeft(result)) {
      expect(result.value).toBeInstanceOf(OcrFailure);
    }
  });

  it('rechaza la entrada vacía', async () => {
    const useCase = new ScanMedicineBarcodeOrTextUseCase(createOcrMock('x'));
    const result = await useCase.execute('');

    expect(isLeft(result)).toBe(true);
  });
});