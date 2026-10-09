/**
 * Datasource de OCR. El dominio no conoce la librería concreta
 * (p. ej. ML Kit), solo esta abstracción.
 */
export interface OcrDataSource {
  /**
   * Reconoce texto en una imagen local.
   * @param imagePath Ruta del archivo de imagen.
   * @returns El texto reconocido completo.
   */
  recognizeText(imagePath: string): Promise<string>;
}