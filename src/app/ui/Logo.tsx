/**
 * Logo de MobiMed.
 *
 * Temporalmente muestra un ícono representativo (pastilla 💊) + wordmark.
 *
 * ── Cómo reemplazarlo por un asset real ─────────────────────────────────────
 *   1. Coloca el archivo en `src/assets/logo.png`.
 *   2. Sustituye `LOGO_IMAGE` por la línea descomentada:
 *        const LOGO_IMAGE: number | null = require('../../assets/logo.png');
 *      El componente renderizará la imagen automáticamente (resizeMode contain)
 *      y el ícono temporal dejará de mostrarse. No hace falta tocar nada más.
 */
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useTheme } from './theme';

// ⬇️ Estructura lista para reemplazar con un asset:
// const LOGO_IMAGE: number | null = require('../../assets/logo.png');
const LOGO_IMAGE: number | null = null;

const SIZES = {
  sm: { icon: 40, text: 16 },
  md: { icon: 52, text: 20 },
  lg: { icon: 68, text: 24 },
} as const;

interface LogoProps {
  /** Tamaño del logo (sm | md | lg). Por defecto `md`. */
  size?: keyof typeof SIZES;
}

export function Logo({ size = 'md' }: LogoProps) {
  const { colors } = useTheme();
  const dims = SIZES[size];

  // Con un asset configurado, mostramos la imagen en lugar del ícono.
  if (LOGO_IMAGE) {
    return (
      <Image
        source={LOGO_IMAGE}
        style={[styles.image, { width: dims.icon * 2, height: dims.icon }]}
        resizeMode="contain"
        accessibilityLabel="Logo de MobiMed"
      />
    );
  }

  return (
    <View style={styles.row}>
      <View
        style={[
          styles.iconBadge,
          {
            width: dims.icon,
            height: dims.icon,
            borderRadius: dims.icon / 2,
            backgroundColor: colors.primarySoft,
          },
        ]}>
        <Text style={{ fontSize: dims.icon * 0.52, color: colors.primary }}>
          💊
        </Text>
      </View>
      <View>
        <Text style={[styles.wordmark, { color: colors.text, fontSize: dims.text }]}>
          Mobi
          <Text style={{ color: colors.primary }}>Med</Text>
        </Text>
        <Text style={[styles.tagline, { color: colors.textMuted }]}>
          Tus tomas, a tiempo
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBadge: { alignItems: 'center', justifyContent: 'center' },
  image: {},
  wordmark: { fontWeight: '800' },
  tagline: { fontSize: 12, marginTop: 2 },
});