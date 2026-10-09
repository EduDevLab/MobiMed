import TextRecognition from '@react-native-ml-kit/text-recognition';
import { OcrFailure } from '../../../../core/errors/Failure';
import type { OcrDataSource } from './OcrDataSource';

/**
 * Implementación de OCR con Google ML Kit (Text Recognition)
 * a través del puente nativo `@react-native-ml-kit/text-recognition`.
 */
export class TextRecognitionOcrDataSource implements OcrDataSource {
  async recognizeText(imagePath: string): Promise<string> {
    try {
      const result = await TextRecognition.recognize(imagePath);
      return result?.text?.trim() ?? '';
    } catch (error) {
      throw new OcrFailure('No se pudo reconocer el texto de la imagen.', error);
    }
  }
}