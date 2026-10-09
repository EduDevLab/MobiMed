/**
 * Pantalla de Configuración.
 * Aloja las preferencias de la app (actualmente el selector de tema, que antes
 * vivía en la pantalla principal).
 */
import React, { useMemo } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../../../app/store';
import { updateThemePreference } from '../../../../core/theme/themeSlice';
import type { ThemePreference } from '../../../../core/theme/themeSlice';
import { Chip, Section } from '../../../../app/ui/components';
import { useTheme, type PaletteColors } from '../../../../app/ui/theme';

const THEME_OPTIONS: {
  value: ThemePreference;
  label: string;
  hint: string;
}[] = [
  { value: 'system', label: 'Sistema', hint: 'Sigue el tema del teléfono.' },
  { value: 'light', label: 'Claro', hint: 'Colores claros siempre.' },
  { value: 'dark', label: 'Oscuro', hint: 'Colores oscuros siempre.' },
];

export default function SettingsScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const dispatch = useAppDispatch();
  const preference = useAppSelector(state => state.theme.preference);

  const activeHint =
    THEME_OPTIONS.find(option => option.value === preference)?.hint ?? '';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Section title="Tema de la app">
          <View style={styles.chipRow}>
            {THEME_OPTIONS.map(option => (
              <Chip
                key={option.value}
                label={option.label}
                selected={preference === option.value}
                onPress={() => dispatch(updateThemePreference(option.value))}
              />
            ))}
          </View>
          <Text style={styles.hint}>{activeHint}</Text>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: PaletteColors) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    content: { padding: 16 },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 6 },
    hint: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 4,
      lineHeight: 17,
    },
  });
}