import React, { useMemo, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../../app/navigation/types';
import { useAppDispatch, useAppSelector } from '../../../../app/store';
import { setDraft } from '../store/reminderSlice';
import {
  AppButton,
  Chip,
  FormField,
  Section,
} from '../../../../app/ui/components';
import { useTheme, type PaletteColors } from '../../../../app/ui/theme';
import {
  formatTime,
  isValidDateOnly,
  isValidTime,
  parseLocalIso,
  toDateOnly,
} from '../../../../core/utils/dates';

type Props = NativeStackScreenProps<RootStackParamList, 'ReminderForm'>;

/** Intervalos rápidos en horas (se traducen a minutos al guardar). */
const INTERVAL_HOUR_OPTIONS = [4, 6, 8, 12, 24];
const DAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
/** Intervalo por defecto: 8 horas, en minutos. */
const DEFAULT_INTERVAL_MINUTES = 8 * 60;

/** Primera hora completa futura: 18:29 → 19:00. */
function nextFullHour(date: Date): string {
  const next = new Date(date);
  next.setMinutes(0, 0, 0);
  next.setHours(next.getHours() + 1);
  return formatTime(next);
}

export default function ReminderFormScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const dispatch = useAppDispatch();
  const draft = useAppSelector(state => state.reminders.draft);

  const draftIntervalMinutes =
    draft?.intervalMinutes ?? DEFAULT_INTERVAL_MINUTES;

  const [startDate, setStartDate] = useState(() => {
    const value = draft?.startDatetime;
    return value ? value.slice(0, 10) : toDateOnly(new Date());
  });
  const [startTime, setStartTime] = useState(() => {
    const value = draft?.startDatetime;
    // Sin draft, se sugiere la próxima hora completa para que el valor por
    // defecto nunca esté en el pasado (y no dispare el aviso al abrir).
    return value ? value.slice(11, 16) : nextFullHour(new Date());
  });
  /** Campos acoplados: horas y minutos del intervalo entre tomas. */
  const [hoursText, setHoursText] = useState(
    String(Math.floor(draftIntervalMinutes / 60)),
  );
  const [minutesText, setMinutesText] = useState(
    String(draftIntervalMinutes % 60),
  );
  const [frequencyDays, setFrequencyDays] = useState<number[]>(
    draft?.frequencyDays ?? [],
  );
  const [endDate, setEndDate] = useState<string | null>(draft?.endDate ?? null);
  const [showPicker, setShowPicker] = useState<'date' | 'time' | null>(null);

  /** Base para el DateTimePicker nativo (fecha/hora en curso con fallback). */
  const pickerBase = useMemo(() => {
    const parsed = parseLocalIso(`${startDate}T${startTime}`);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  }, [startDate, startTime]);

  /** True si la primera toma elegida ya pasó (se alineará al futuro). */
  const startInPast = pickerBase.getTime() < Date.now();

  function handlePickerChange(
    event: DateTimePickerEvent,
    date: Date | undefined,
    mode: 'date' | 'time',
  ) {
    setShowPicker(null);
    if (event.type !== 'set' || !date) {
      return;
    }
    if (mode === 'date') {
      setStartDate(toDateOnly(date));
    } else {
      setStartTime(formatTime(date));
    }
  }

  function toggleDay(day: number) {
    setFrequencyDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day],
    );
  }

  /** Botón rápido: fija horas y pone los minutos a 0. */
  function handleQuickInterval(hours: number) {
    setHoursText(String(hours));
    setMinutesText('0');
  }

  function handleSave() {
    const finalDate = startDate.trim();
    const finalTime = startTime.trim();

    if (!isValidDateOnly(finalDate)) {
      Alert.alert('Fecha inválida', 'La fecha de inicio debe ser YYYY-MM-DD.');
      return;
    }
    if (!isValidTime(finalTime)) {
      Alert.alert('Hora inválida', 'La hora debe estar en formato HH:mm.');
      return;
    }
    if (frequencyDays.length === 0) {
      Alert.alert('Sin días', 'Selecciona al menos un día de la semana.');
      return;
    }

    const hours = Number(hoursText.trim());
    const minutes = Number(minutesText.trim());
    const totalMinutes = hours * 60 + minutes;

    if (
      !Number.isInteger(hours) ||
      hours < 0 ||
      !Number.isInteger(minutes) ||
      minutes < 0 ||
      minutes > 59 ||
      totalMinutes < 1
    ) {
      Alert.alert(
        'Intervalo inválido',
        'Indica horas mayores o iguales a 0 y minutos entre 0 y 59, con al menos 1 minuto en total (p. ej. 4 h 30 min).',
      );
      return;
    }

    if (endDate && endDate.trim()) {
      const finalEnd = endDate.trim();
      if (!isValidDateOnly(finalEnd)) {
        Alert.alert('Fecha inválida', 'La fecha de fin debe ser YYYY-MM-DD.');
        return;
      }
      if (finalEnd < finalDate) {
        Alert.alert(
          'Rango inválido',
          'La fecha de fin no puede ser anterior a la de inicio.',
        );
        return;
      }
    }

    dispatch(
      setDraft({
        startDatetime: `${finalDate}T${finalTime}`,
        intervalMinutes: totalMinutes,
        frequencyDays: [...frequencyDays].sort((a, b) => a - b),
        endDate: endDate && endDate.trim() ? endDate.trim() : null,
      }),
    );
    navigation.goBack();
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Section title="Primera toma">
          <Text style={styles.hint}>
            Indica la fecha y hora exactas de la primera toma. Las siguientes
            se calculan sumando el intervalo.
          </Text>

          {startInPast ? (
            <Text style={styles.warning}>
              ⚠️ La fecha y hora elegidas ya pasaron: la primera toma se
              programará en la próxima ocurrencia del intervalo.
            </Text>
          ) : null}

          <View style={styles.row}>
            <View style={styles.flex}>
              <FormField
                label="Fecha de inicio (YYYY-MM-DD)"
                value={startDate}
                onChangeText={setStartDate}
                placeholder="2026-10-08"
              />
            </View>
            <View style={styles.pickerButton}>
              <AppButton
                label="Elegir fecha"
                variant="outline"
                onPress={() => setShowPicker('date')}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.flex}>
              <FormField
                label="Hora (HH:mm)"
                value={startTime}
                onChangeText={setStartTime}
                placeholder="08:00"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.pickerButton}>
              <AppButton
                label="Elegir hora"
                variant="outline"
                onPress={() => setShowPicker('time')}
              />
            </View>
          </View>
        </Section>

        <Section title="Frecuencia">
          <Text style={styles.hint}>
            Cada cuánto tiempo debes tomarlo a partir de la primera toma.
            Se admiten fracciones de hora (p. ej. 4 h 30 min).
          </Text>
          <View style={styles.chipRow}>
            {INTERVAL_HOUR_OPTIONS.map(hours => (
              <Chip
                key={hours}
                label={`Cada ${hours} h`}
                selected={
                  hoursText.trim() === String(hours) &&
                  minutesText.trim() === '0'
                }
                onPress={() => handleQuickInterval(hours)}
              />
            ))}
          </View>
          <View style={styles.row}>
            <View style={styles.flex}>
              <FormField
                label="Horas"
                value={hoursText}
                onChangeText={setHoursText}
                placeholder="4"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.flex}>
              <FormField
                label="Minutos"
                value={minutesText}
                onChangeText={setMinutesText}
                placeholder="30"
                keyboardType="numeric"
              />
            </View>
          </View>
        </Section>

        <Section title="Días de la semana">
          <Text style={styles.hint}>
            Solo se programarán alarmas los días seleccionados.
          </Text>
          <View style={styles.chipRow}>
            {DAY_LABELS.map((label, index) => (
              <Chip
                key={label}
                label={label}
                selected={frequencyDays.includes(index)}
                onPress={() => toggleDay(index)}
              />
            ))}
          </View>
        </Section>

        <Section title="Rango de fechas">
          <FormField
            label="Fecha de fin (opcional, YYYY-MM-DD)"
            value={endDate ?? ''}
            onChangeText={text => setEndDate(text || null)}
            placeholder="Déjalo vacío si es continuo"
          />
          <Text style={styles.hint}>
            Sin fecha de fin, se programan las próximas 500 tomas automáticamente.
          </Text>
        </Section>

        <AppButton label="Guardar programación" onPress={handleSave} />
      </ScrollView>

      {showPicker === 'date' ? (
        <DateTimePicker
          value={pickerBase}
          mode="date"
          display="default"
          onChange={(event, date) => handlePickerChange(event, date, 'date')}
        />
      ) : null}
      {showPicker === 'time' ? (
        <DateTimePicker
          value={pickerBase}
          mode="time"
          display="default"
          is24Hour={false}
          onChange={(event, date) => handlePickerChange(event, date, 'time')}
        />
      ) : null}
    </SafeAreaView>
  );
}

function createStyles(colors: PaletteColors) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    content: { padding: 16, paddingBottom: 40 },
    hint: {
      fontSize: 12,
      color: colors.textMuted,
      marginBottom: 10,
      lineHeight: 17,
    },
    warning: {
      fontSize: 12,
      color: colors.danger,
      backgroundColor: colors.dangerSoft,
      borderRadius: 8,
      padding: 8,
      marginBottom: 10,
      lineHeight: 16,
    },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
    row: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 10,
    },
    flex: { flex: 1 },
    pickerButton: { paddingBottom: 2 },
  });
}