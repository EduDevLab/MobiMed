import {
  firstFutureOccurrence,
  formatInterval,
  formatTime,
  intervalOccurrences,
  isValidDateOnly,
  isValidTime,
  parseDateOnly,
  toDateOnly,
  toLocalIso,
} from '../dates';

describe('intervalOccurrences', () => {
  it('genera una ocurrencia cada `interval_minutes` desde la primera toma', () => {
    const timestamps = intervalOccurrences(
      {
        startDatetime: '2026-10-08T08:00',
        intervalMinutes: 8 * 60, // cada 8 h
        frequencyDays: [],
        endDate: null,
      },
      3,
    );
    expect(timestamps).toHaveLength(3);
    expect(timestamps[0]).toBe(new Date(2026, 9, 8, 8, 0).getTime());
    expect(timestamps[1]).toBe(new Date(2026, 9, 8, 16, 0).getTime());
    expect(timestamps[2]).toBe(new Date(2026, 9, 9, 0, 0).getTime());
  });

  it('soporta intervalos fraccionados en minutos (p. ej. cada 4 h 30 min)', () => {
    const timestamps = intervalOccurrences(
      {
        startDatetime: '2026-10-08T08:00',
        intervalMinutes: 4 * 60 + 30, // 270 min
        frequencyDays: [],
        endDate: null,
      },
      3,
    );
    expect(timestamps[0]).toBe(new Date(2026, 9, 8, 8, 0).getTime());
    expect(timestamps[1]).toBe(new Date(2026, 9, 8, 12, 30).getTime());
    expect(timestamps[2]).toBe(new Date(2026, 9, 8, 17, 0).getTime());
  });

  it('solo programa los días permitidos en frequency_days', () => {
    // Viernes 09/10/2026 08:00, cada 24 h, solo lunes (1) y viernes (5).
    const timestamps = intervalOccurrences({
      startDatetime: '2026-10-09T08:00',
      intervalMinutes: 24 * 60,
      frequencyDays: [1, 5],
      endDate: '2026-10-19',
    });
    expect(timestamps.map(t => toDateOnly(new Date(t)))).toEqual([
      '2026-10-09', // viernes (inicio)
      '2026-10-12', // lunes
      '2026-10-16', // viernes
      '2026-10-19', // lunes (fin inclusivo)
    ]);
  });

  it('respeta la fecha de fin de forma inclusiva', () => {
    // Empieza 08:00 del 08/10; con endDate = ese mismo día solo entran 08:00 y 16:00.
    const timestamps = intervalOccurrences({
      startDatetime: '2026-10-08T08:00',
      intervalMinutes: 8 * 60,
      frequencyDays: [],
      endDate: '2026-10-08',
    });
    expect(timestamps).toHaveLength(2);
  });

  it('respeta el límite de alarmas programables', () => {
    const timestamps = intervalOccurrences(
      {
        startDatetime: '2026-01-01T08:00',
        intervalMinutes: 60, // cada 1 h
        frequencyDays: [],
        endDate: '2026-12-31',
      },
      10,
    );
    expect(timestamps).toHaveLength(10);
  });

  it('devuelve una lista vacía si la primera toma o el intervalo no son válidos', () => {
    expect(
      intervalOccurrences({
        startDatetime: 'basura',
        intervalMinutes: 480,
        frequencyDays: [],
        endDate: null,
      }),
    ).toEqual([]);
    expect(
      intervalOccurrences({
        startDatetime: '2026-10-08T08:00',
        intervalMinutes: 0,
        frequencyDays: [],
        endDate: null,
      }),
    ).toEqual([]);
  });
});

describe('firstFutureOccurrence', () => {
  const at = (h: number, m: number) => new Date(2026, 9, 8, h, m);

  it('devuelve el mismo instante si la toma inicial es futura', () => {
    const start = at(20, 0).getTime();
    const now = at(12, 0).getTime();
    expect(firstFutureOccurrence(start, 60, now)).toBe(start);
  });

  it('avanza al siguiente múltiplo del intervalo cuando la hora inicial ya pasó', () => {
    const start = at(6, 0).getTime();
    const now = at(6, 25).getTime();
    expect(firstFutureOccurrence(start, 60, now)).toBe(at(7, 0).getTime());
    expect(firstFutureOccurrence(start, 30, now)).toBe(at(6, 30).getTime());
    expect(firstFutureOccurrence(start, 1, now)).toBe(at(6, 26).getTime());
  });

  it('con intervalos fraccionados alinea al siguiente punto del grid', () => {
    const start = at(8, 0).getTime();
    const now = at(8, 5).getTime();
    // 270 min = 4 h 30 min → grid: 08:00, 12:30, 17:00...
    expect(firstFutureOccurrence(start, 270, now)).toBe(at(12, 30).getTime());
  });
});

describe('formatInterval', () => {
  it('formatea intervalos en minutos de forma legible', () => {
    expect(formatInterval(4 * 60 + 30)).toBe('Cada 4 h 30 min');
    expect(formatInterval(8 * 60)).toBe('Cada 8 h');
    expect(formatInterval(24 * 60)).toBe('Cada 24 h');
    expect(formatInterval(30)).toBe('Cada 30 min');
  });
});

describe('validators', () => {
  it('valida horarios HH:mm', () => {
    expect(isValidTime('08:00')).toBe(true);
    expect(isValidTime('23:59')).toBe(true);
    expect(isValidTime('24:00')).toBe(false);
    expect(isValidTime('8:00')).toBe(true);
    expect(isValidTime('08-00')).toBe(false);
  });

  it('valida fechas YYYY-MM-DD reales', () => {
    expect(isValidDateOnly('2026-10-07')).toBe(true);
    expect(isValidDateOnly('2026-02-29')).toBe(false); // 2026 no es bisiesto
    expect(isValidDateOnly('07/10/2026')).toBe(false);
    expect(isValidDateOnly('2026-13-01')).toBe(false);
  });
});

describe('format helpers', () => {
  it('convierte Date a YYYY-MM-DD', () => {
    expect(toDateOnly(new Date(2026, 9, 7))).toBe('2026-10-07');
  });

  it('convierte Date a ISO local YYYY-MM-DDTHH:mm', () => {
    expect(toLocalIso(new Date(2026, 9, 7, 20, 30))).toBe('2026-10-07T20:30');
  });

  it('formatea la hora como HH:mm', () => {
    expect(formatTime(new Date(2026, 9, 7, 8, 5))).toBe('08:05');
  });

  it('parsea YYYY-MM-DD como fecha local a medianoche', () => {
    expect(parseDateOnly('2026-10-07').getTime()).toBe(
      new Date(2026, 9, 7).getTime(),
    );
  });
});