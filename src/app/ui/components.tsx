import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { useTheme, type PaletteColors } from './theme';

type ButtonVariant = 'primary' | 'outline' | 'danger' | 'ghost';

interface AppButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export function AppButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
}: AppButtonProps) {
  const { colors } = useTheme();
  const { styles, variantStyles, labelStyles } = useMemo(
    () => makeButtonStyles(colors),
    [colors],
  );
  const isDisabled = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        variantStyles[variant],
        pressed && !isDisabled ? styles.buttonPressed : null,
        isDisabled ? styles.buttonDisabled : null,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? colors.primary : '#fff'} />
      ) : (
        <Text style={[styles.buttonLabel, labelStyles[variant]]}>{label}</Text>
      )}
    </Pressable>
  );
}

interface ChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export function Chip({ label, selected, onPress }: ChipProps) {
  const { colors } = useTheme();
  const { styles } = useMemo(() => makeChipStyles(colors), [colors]);
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected ? styles.chipSelected : styles.chipUnselected,
        pressed ? styles.chipPressed : null,
      ]}>
      <Text style={[styles.chipLabel, selected ? styles.chipLabelSelected : null]}>
        {label}
      </Text>
    </Pressable>
  );
}

interface FormFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'phone-pad';
  multiline?: boolean;
}

export function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  multiline = false,
}: FormFieldProps) {
  const { colors } = useTheme();
  const { styles } = useMemo(() => makeFormFieldStyles(colors), [colors]);
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, multiline ? styles.inputMultiline : null]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        keyboardType={keyboardType}
        multiline={multiline}
        autoCapitalize="words"
      />
    </View>
  );
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

export function Section({ title, children }: SectionProps) {
  const { colors } = useTheme();
  const { styles } = useMemo(() => makeSectionStyles(colors), [colors]);
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

export function SummaryRow({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  const { styles } = useMemo(() => makeSummaryStyles(colors), [colors]);
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

interface ErrorBannerProps {
  message: string | null;
}

export function ErrorBanner({ message }: ErrorBannerProps) {
  const { colors } = useTheme();
  const { styles } = useMemo(() => makeErrorStyles(colors), [colors]);
  if (!message) {
    return null;
  }
  return (
    <View style={styles.errorBanner}>
      <Text style={styles.errorBannerText}>{message}</Text>
    </View>
  );
}

function makeButtonStyles(colors: PaletteColors) {
  const styles = StyleSheet.create({
    button: {
      borderRadius: 10,
      paddingVertical: 13,
      paddingHorizontal: 18,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 46,
    } as ViewStyle,
    buttonPressed: { opacity: 0.85 },
    buttonDisabled: { opacity: 0.5 },
    buttonLabel: {
      fontSize: 15,
      fontWeight: '600',
      color: '#ffffff',
    } as TextStyle,
  });

  const variantStyles: Record<ButtonVariant, ViewStyle> = {
    primary: { backgroundColor: colors.primary },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.primary,
    },
    danger: { backgroundColor: colors.danger },
    ghost: { backgroundColor: colors.primarySoft },
  };

  const labelStyles: Record<ButtonVariant, TextStyle> = {
    primary: { color: '#ffffff' },
    outline: { color: colors.primary },
    danger: { color: '#ffffff' },
    ghost: { color: colors.primary },
  };

  return { styles, variantStyles, labelStyles };
}

function makeChipStyles(colors: PaletteColors) {
  const styles = StyleSheet.create({
    chip: {
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 20,
      borderWidth: 1,
      marginRight: 8,
      marginBottom: 8,
    },
    chipSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    chipUnselected: {
      backgroundColor: colors.card,
      borderColor: colors.border,
    },
    chipPressed: { opacity: 0.8 },
    chipLabel: { fontSize: 13, color: colors.text },
    chipLabelSelected: { color: '#ffffff', fontWeight: '600' },
  });
  return { styles };
}

function makeFormFieldStyles(colors: PaletteColors) {
  const styles = StyleSheet.create({
    fieldGroup: { marginBottom: 14 },
    fieldLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 6,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      paddingVertical: 10,
      paddingHorizontal: 12,
      fontSize: 15,
      color: colors.text,
      backgroundColor: colors.card,
    },
    inputMultiline: { minHeight: 64, textAlignVertical: 'top' },
  });
  return { styles };
}

function makeSectionStyles(colors: PaletteColors) {
  const styles = StyleSheet.create({
    section: {
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 14,
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 10,
    },
  });
  return { styles };
}

function makeSummaryStyles(colors: PaletteColors) {
  const styles = StyleSheet.create({
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 4,
    },
    summaryLabel: { fontSize: 13, color: colors.textMuted },
    summaryValue: { fontSize: 13, fontWeight: '600', color: colors.text },
  });
  return { styles };
}

function makeErrorStyles(colors: PaletteColors) {
  const styles = StyleSheet.create({
    errorBanner: {
      backgroundColor: colors.dangerSoft,
      borderRadius: 10,
      padding: 12,
      marginBottom: 12,
    },
    errorBannerText: { color: colors.danger, fontSize: 13 },
  });
  return { styles };
}