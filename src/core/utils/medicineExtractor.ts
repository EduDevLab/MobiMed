import type { MedicinePresentation } from '../../features/medicines/domain/entities/Medicine';

/**
 * Extracción de datos de medicamentos a partir del texto reconocido
 * por OCR. Heurísticas basadas en expresiones regulares (regex).
 *
 * Reglas:
 *  - Dosis: busca "número + unidad" (mg, mcg/µg, g, ml, UI, etc.).
 *  - Presentación: busca palabras clave (pastilla, cápsula, jarabe…).
 *  - Nombre: primeras líneas de texto tras limpiar ruido/signos
 *    habituales de etiquetas de medicamentos.
 */
export interface ExtractedMedicineInfo {
  name: string;
  dosage: string;
  presentation: MedicinePresentation;
}

const DOSAGE_PATTERNS: ReadonlyArray<RegExp> = [
  /\b(\d+(?:[.,]\d+)?)\s*(mg\/ml|mg)(?:\/ml)?\b/i,
  /\b(\d+(?:[.,]\d+)?)\s*(mcg|µg|µgr|microgramos?)\b/i,
  /\b(\d+(?:[.,]\d+)?)\s*(ui|unidades? internacionales?)\b/i,
  /\b(\d+(?:[.,]\d+)?)\s*(g|gr|gramos?)\b/i,
  /\b(\d+(?:[.,]\d+)?)\s*(ml|mililitros?)\b/i,
  /\b(\d+(?:[.,]\d+)?)\s*(%)\b/,
];

const PRESENTATION_KEYWORDS: ReadonlyArray<{
  keyword: RegExp;
  presentation: MedicinePresentation;
}> = [
  { keyword: /\bjarabe\b|\bsyrup\b|\bsuspension\b|\bsuspensión\b/i, presentation: 'Jarabe' },
  { keyword: /\bc[áa]psul(a|as)\b|\bcapsule\b/i, presentation: 'Cápsula' },
  { keyword: /\bpastilla\b|\btablet\b|\bcomprimido\b/i, presentation: 'Pastilla' },
  { keyword: /\binyecci[oó]n\b|\binyeccion\b|\binjection\b|\bampoll(a|as)\b/i, presentation: 'Inyección' },
  { keyword: /\bgotas\b|\bdrops\b/i, presentation: 'Gotas' },
  { keyword: /\bcrema\b|\bpomada\b|\bung[üu]ento\b/i, presentation: 'Crema' },
  { keyword: /\binhalador\b|\binhaler\b|\baerosol\b/i, presentation: 'Inhalador' },
];

const NOISE_WORDS: ReadonlyArray<RegExp> = [
  /laboratorios?\b|lab\.|reg\.?\s*sanitar/i,
  /auto\s*medicaci/i,
  /venta\s*(libre|bajo?\s*receta)/i,
  /indicaciones?|contraindicaciones?|posolog/i,
  /no\s*administrar|consulte\s*a\s*su\s*m[eé]dico/i,
  /mant[eé]ngase|fuera\s*del\s*alcance/i,
  /www\.|https?:\/\//i,
];

function cleanLine(line: string): string {
  return line
    .replace(/[*_#>|•·]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeNumber(raw: string): string {
  return raw.replace(',', '.');
}

function detectPresentation(text: string): MedicinePresentation {
  for (const entry of PRESENTATION_KEYWORDS) {
    if (entry.keyword.test(text)) {
      return entry.presentation;
    }
  }
  return 'Otro';
}

function detectDosage(text: string): string {
  for (const pattern of DOSAGE_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      const value = normalizeNumber(match[1]);
      const unit = (match[2] ?? '').toLowerCase();
      return `${value} ${unit}`.trim();
    }
  }
  return '';
}

function extractName(lines: string[]): string {
  const candidates = lines
    .map(cleanLine)
    .filter(Boolean)
    .filter(line => /[a-záéíóúñü]{3}/i.test(line))
    .filter(line => !NOISE_WORDS.some(re => re.test(line)));

  if (candidates.length === 0) {
    return '';
  }

  // Preferimos la primera línea que no parezca una unidad de concentración.
  const first = candidates[0];
  const words = first.split(' ').slice(0, 4).join(' ');
  return words
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Extrae nombre, dosis y presentación del texto plano del OCR.
 */
export function extractMedicineInfo(rawText: string): ExtractedMedicineInfo {
  const text = (rawText ?? '').trim();
  const lines = text.split(/\r?\n/);

  return {
    name: extractName(lines),
    dosage: detectDosage(text),
    presentation: detectPresentation(text),
  };
}