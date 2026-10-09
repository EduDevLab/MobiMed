/**
 * Resultado de operaciones que pueden fallar (patrón Either / Result).
 * Sustituye a las excepciones en los casos de uso del dominio.
 */
export type Either<L, R> =
  | { kind: 'left'; value: L }
  | { kind: 'right'; value: R };

export const left = <L, R>(value: L): Either<L, R> => ({
  kind: 'left',
  value,
});

export const right = <L, R>(value: R): Either<L, R> => ({
  kind: 'right',
  value,
});

export const isLeft = <L, R>(
  e: Either<L, R>,
): e is { kind: 'left'; value: L } => e.kind === 'left';

export const isRight = <L, R>(
  e: Either<L, R>,
): e is { kind: 'right'; value: R } => e.kind === 'right';

/** Datos descartables para respuestas de tipo `Either<Failure, Unit>`. */
export type Unit = void;