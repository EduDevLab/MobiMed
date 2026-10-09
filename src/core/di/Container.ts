/** Identificador tipado para el contenedor de dependencias. */
export type Token<T> = { readonly __token: symbol; readonly __type?: T };

/** Crea un token tipado. */
export function createToken<T>(name: string): Token<T> {
  return { __token: Symbol(name) } as Token<T>;
}

/**
 * Contenedor de dependencias simple (Service Locator).
 * Registra fábricas y resuelve instancias únicas (singleton) de forma perezosa.
 */
export class Container {
  private readonly factories = new Map<symbol, () => unknown>();

  register<T>(token: Token<T>, factory: () => T): void {
    this.factories.set(token.__token, factory as () => unknown);
  }

  resolve<T>(token: Token<T>): T {
    const factory = this.factories.get(token.__token);
    if (!factory) {
      throw new Error(`Dependencia no registrada: ${String(token.__token)}`);
    }
    return factory() as T;
  }
}

/** Contenedor global de la aplicación. */
export const container = new Container();