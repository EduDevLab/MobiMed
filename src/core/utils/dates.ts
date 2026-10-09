const DAY_MS = 24 * 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;

/** Convierte `'YYYY-MM-DD'` en un `Date` local a medianoche. */
export function parseDateOnly(value: string): Date {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Convierte un `Date` en `'YYYY-MM-DD'` local. */
export function toDateOnly(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Convierte un `Date` en un ISO local `'YYYY-MM-DDTHH:mm'`
 * (sin zona horaria, por lo que JS lo interpreta como hora local).
 */
export function toLocalIso(date: Date): string {
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${toDateOnly(date)}T${hh}:${mm}`;
}

/** Parsea un ISO local (sin sufijo de zona) como fecha/hora local. */
export function parseLocalIso(value: string): Date {
  return new Date(value);
}

/** Formatea un `Date` como `HH:mm`. */
export function formatTime(date: Date): string {
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

/** Valida un horario en formato HH:mm (24 h). */
export function isValidTime(hhmm: string): boolean {
  const match = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(hhmm.trim());
  return match !== null;
}

/** Valida una fecha en formato YYYY-MM-DD y que sea una fecha real. */
export function isValidDateOnly(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) {
    return false;
  }
  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

/**
 * Ventana de programación por intervalo de minutos transcurridos.
 * `startDatetime` es el ISO local de la primera toma; las siguientes ocurren
 * sumando `intervalMinutes` en cadena, filtrando los días de `frequencyDays`.
 */
export interface IntervalScheduleWindow {
  startDatetime: string;
  /** Intervalo entre tomas en minutos (270 = 4 h 30 min, 480 = 8 h). */
  intervalMinutes: number;
  /** 0=Domingo..6=Sábado. Vacío = todos los días permitidos. */
  frequencyDays: number[];
  /** Fecha límite (YYYY-MM-DD) inclusiva, si existe. */
  endDate: string | null;
}

/**
 * Calcula los timestamps (epoch ms) de cada toma del tratamiento:
 *
 *   t₀ = startDatetime
 *   tₙ₊₁ = tₙ + intervalMinutes * 1min
 *
 * Solo se programa una alarma si el día de la semana de la ocurrencia está
 * incluido en `frequencyDays`. Respeta el límite nativo de Android (~500).
 */
export function intervalOccurrences(
  window: IntervalScheduleWindow,
  cap = 500,
): number[] {
  const start = parseLocalIso(window.startDatetime);
  if (
    isNaN(start.getTime()) ||
    !Number.isFinite(window.intervalMinutes) ||
    window.intervalMinutes <= 0
  ) {
    return [];
  }

  const end = window.endDate ? parseDateOnly(window.endDate) : null;
  const endExclusive = end ? end.getTime() + DAY_MS : null;

  const out: number[] = [];
  const stepMs = window.intervalMinutes * MINUTE_MS;
  const allDaysAllowed = window.frequencyDays.length === 0;

  let cursor = start.getTime();
  while (out.length < cap && (endExclusive === null || cursor < endExclusive)) {
    if (allDaysAllowed || window.frequencyDays.includes(new Date(cursor).getDay())) {
      out.push(cursor);
    }
    cursor += stepMs;
  }
  return out;
}

/**
 * Devuelve el primer instante del calendario de tomas estrictamente mayor a
 * `nowMillis`. Si la toma inicial ya pasó, avanza al siguiente múltiplo del
 * intervalo (mismo grid), de modo que incluso intervalos pequeños (p. ej.
 * 1 min) con hora de inicio antigua sigan generando tomas futuras.
 */
export function firstFutureOccurrence(
  startMillis: number,
  intervalMinutes: number,
  nowMillis: number = Date.now(),
): number {
  if (!Number.isFinite(intervalMinutes) || intervalMinutes <= 0) {
    return startMillis;
  }
  if (startMillis > nowMillis) {
    return startMillis;
  }
  const stepMs = intervalMinutes * 60 * 1000;
  return startMillis + (Math.floor((nowMillis - startMillis) / stepMs) + 1) * stepMs;
}

/**
 * Formatea un intervalo en minutos de forma legible:
 *   - 270  → "Cada 4 h 30 min"
 *   - 480  → "Cada 8 h"
 *   - 30   → "Cada 30 min"
 */
export function formatInterval(minutes: number): string {
  const total = Math.round(minutes);
  if (total <= 0) {
    return 'Cada —';
  }
  const hours = Math.floor(total / 60);
  const mins = total % 60;
  if (hours > 0 && mins > 0) {
    return `Cada ${hours} h ${mins} min`;
  }
  if (hours > 0) {
    return `Cada ${hours} h`;
  }
  return `Cada ${mins} min`;
}