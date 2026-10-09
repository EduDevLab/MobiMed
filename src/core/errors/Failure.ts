/**
 * Jerarquía de errores de la aplicación.
 * Los casos de uso devuelven `Either<Failure, R>` en lugar de lanzar errores.
 */
export class Failure extends Error {
  constructor(
    message: string,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'Failure';
  }
}

/** Error originado en la base de datos local. */
export class DatabaseFailure extends Failure {
  constructor(message: string, cause?: unknown) {
    super(message, cause);
    this.name = 'DatabaseFailure';
  }
}

/** Error en el reconocimiento óptico de caracteres (OCR). */
export class OcrFailure extends Failure {
  constructor(message: string, cause?: unknown) {
    super(message, cause);
    this.name = 'OcrFailure';
  }
}

/** Error de permisos (cámara, notificaciones, alarmas exactas). */
export class PermissionFailure extends Failure {
  constructor(message: string, cause?: unknown) {
    super(message, cause);
    this.name = 'PermissionFailure';
  }
}

/** Error al programar o cancelar notificaciones/alarmas. */
export class NotificationFailure extends Failure {
  constructor(message: string, cause?: unknown) {
    super(message, cause);
    this.name = 'NotificationFailure';
  }
}

/** Valores de entrada inválidos detectados en el dominio. */
export class ValidationFailure extends Failure {
  constructor(message: string, cause?: unknown) {
    super(message, cause);
    this.name = 'ValidationFailure';
  }
}