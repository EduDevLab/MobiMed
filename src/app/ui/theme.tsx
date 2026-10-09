/**
 * Tema de la app (Claro / Oscuro / Sistema).
 *
 * `ThemeProvider` recibe la preferencia (leída desde Redux en `App.tsx`,
 * donde también se persiste con AsyncStorage) y resuelve el esquema efectivo.
 * El único punto que consulta el hook nativo `useColorScheme()` es el propio
 * provider: el resto de la UI usa `useTheme()` y queda desacoplada de la
 * detección del sistema.
 */
import React, {
  createContext,
  useContext,
  useMemo,
} from 'react';
import { useColorScheme } from 'react-native';
import type { ThemePreference } from '../../core/theme/themeSlice';

/** Paleta de colores expuesta a toda la UI. */
export interface PaletteColors {
  primary: string;
  primarySoft: string;
  danger: string;
  dangerSoft: string;
  success: string;
  successSoft: string;
  text: string;
  textMuted: string;
  border: string;
  background: string;
  card: string;
}

export const lightColors: PaletteColors = {
  primary: '#2563eb',
  primarySoft: '#dbeafe',
  danger: '#dc2626',
  dangerSoft: '#fee2e2',
  success: '#16a34a',
  successSoft: '#dcfce7',
  text: '#0f172a',
  textMuted: '#64748b',
  border: '#e2e8f0',
  background: '#f8fafc',
  card: '#ffffff',
};

export const darkColors: PaletteColors = {
  primary: '#60a5fa',
  primarySoft: '#1e3a5f',
  danger: '#f87171',
  dangerSoft: '#3f1d1d',
  success: '#4ade80',
  successSoft: '#14341f',
  text: '#f1f5f9',
  textMuted: '#94a3b8',
  border: '#334155',
  background: '#0f172a',
  card: '#1e293b',
};

interface ThemeValue {
  /** Esquema efectivamente aplicado en la interfaz. */
  scheme: Exclude<ThemePreference, 'system'>;
  colors: PaletteColors;
  preference: ThemePreference;
}

const ThemeContext = createContext<ThemeValue>({
  scheme: 'light',
  colors: lightColors,
  preference: 'system',
});

export function ThemeProvider({
  preference,
  children,
}: {
  preference: ThemePreference;
  children: React.ReactNode;
}) {
  const systemScheme = useColorScheme() ?? 'light';

  const scheme: ThemeValue['scheme'] =
    preference === 'system' ? systemScheme : preference;
  const colors = scheme === 'dark' ? darkColors : lightColors;

  const value = useMemo<ThemeValue>(
    () => ({ scheme, colors, preference }),
    [scheme, colors, preference],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeValue {
  return useContext(ThemeContext);
}