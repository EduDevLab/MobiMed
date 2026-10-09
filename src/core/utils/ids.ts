/**
 * Generador de identificadores únicos (UUID v4 con fallback).
 * Funciona en Hermes (React Native) donde `crypto.randomUUID`
 * puede no estar disponible como global.
 */
export function generateId(): string {
  const cryptoGlobal = globalThis as { crypto?: { randomUUID?: () => string } };
  const randomUUID = cryptoGlobal.crypto?.randomUUID;
  if (typeof randomUUID === 'function') {
    return randomUUID.call(cryptoGlobal.crypto);
  }

  // Fallback: UUID v4 basado en Math.random.
  /* eslint-disable no-bitwise */
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
  /* eslint-enable no-bitwise */
}