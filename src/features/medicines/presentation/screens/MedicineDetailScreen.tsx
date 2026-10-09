import React, { useEffect, useMemo } from 'react';
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../../app/navigation/types';
import { useAppDispatch, useAppSelector } from '../../../../app/store';
import { fetchMedicines, removeMedicine } from '../store/medicineSlice';
import { cancelReminder, fetchRemindersForMedicine } from '../../../reminders/presentation/store/reminderSlice';
import {
  AppButton,
  ErrorBanner,
  Section,
  SummaryRow,
} from '../../../../app/ui/components';
import { useTheme, type PaletteColors } from '../../../../app/ui/theme';
import { formatInterval, toDateOnly } from '../../../../core/utils/dates';

type Props = NativeStackScreenProps<RootStackParamList, 'MedicineDetail'>;

const DAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export default function MedicineDetailScreen({ route, navigation }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { medicineId } = route.params;
  const dispatch = useAppDispatch();

  const medicine = useAppSelector(state =>
    state.medicines.items.find(item => item.id === medicineId),
  );
  const allReminders = useAppSelector(state => state.reminders.items);
  const reminders = useMemo(
    () => allReminders.filter(r => r.medicineId === medicineId),
    [allReminders, medicineId],
  );
  const reminderError = useAppSelector(state => state.reminders.error);

  useEffect(() => {
    if (!medicine) {
      dispatch(fetchMedicines());
    }
    dispatch(fetchRemindersForMedicine(medicineId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [medicineId]);

  async function handleToggleReminder(reminderId: string, value: boolean) {
    if (!value) {
      await dispatch(cancelReminder(reminderId));
    }
  }

  function confirmDelete() {
    Alert.alert(
      'Eliminar medicamento',
      'Se eliminará el medicamento, sus recordatorios y se cancelarán todas sus alarmas programadas.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const result = await dispatch(removeMedicine(medicineId));
            if (removeMedicine.fulfilled.match(result)) {
              navigation.goBack();
            }
          },
        },
      ],
    );
  }

  if (!medicine) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.notFound}>Medicamento no encontrado.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <ErrorBanner message={reminderError} />

        <Section title="Medicamento">
          {medicine.photoPath ? (
            <View style={styles.photoContainer}>
              <Image source={{ uri: medicine.photoPath }} style={styles.photo} />
            </View>
          ) : null}
          <SummaryRow label="Nombre" value={medicine.name} />
          <SummaryRow label="Dosis" value={medicine.dosage || '—'} />
          <SummaryRow label="Presentación" value={medicine.presentation} />
          <SummaryRow
            label="Registrado"
            value={toDateOnly(new Date(medicine.createdAt))}
          />
        </Section>

        <Section title="Recordatorios programados">
          {reminders.length === 0 ? (
            <Text style={styles.emptyText}>
              Este medicamento no tiene recordatorios programados.
            </Text>
          ) : (
            reminders.map(reminder => (
              <View key={reminder.id} style={styles.reminderCard}>
                <View style={styles.reminderHeader}>
                  <Text style={styles.reminderSlots}>
                    {formatInterval(reminder.intervalMinutes)} desde{' '}
                    {reminder.startDatetime.replace('T', ' ')}
                  </Text>
                  <Switch
                    value={reminder.isActive}
                    onValueChange={value =>
                      handleToggleReminder(reminder.id, value)
                    }
                    trackColor={{ true: colors.primary }}
                  />
                </View>
                <Text style={styles.reminderDays}>
                  {reminder.frequencyDays.length > 0
                    ? `Días: ${reminder.frequencyDays.map(d => DAY_LABELS[d]).join(', ')}`
                    : 'Todos los días'}
                </Text>
                <Text style={styles.reminderRange}>
                  {reminder.endDate
                    ? `Hasta ${reminder.endDate}`
                    : 'Tratamiento continuo'}
                </Text>
                <Text style={styles.reminderState}>
                  {reminder.isActive ? '● Activo' : '○ Inactivo'}
                </Text>
              </View>
            ))
          )}
        </Section>

        <AppButton
          label="Eliminar medicamento"
          variant="danger"
          onPress={confirmDelete}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: PaletteColors) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    content: { padding: 16, paddingBottom: 40 },
    notFound: {
      textAlign: 'center',
      marginTop: 60,
      color: colors.textMuted,
      fontSize: 15,
    },
    photoContainer: { alignItems: 'center', marginBottom: 12 },
    photo: { width: 120, height: 120, borderRadius: 10 },
    emptyText: { fontSize: 13, color: colors.textMuted },
    reminderCard: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      padding: 12,
      marginBottom: 10,
    },
    reminderHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    reminderSlots: { fontSize: 14, fontWeight: '700', color: colors.text, flex: 1 },
    reminderDays: { fontSize: 13, color: colors.text, marginTop: 4 },
    reminderRange: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
    reminderState: {
      fontSize: 12,
      color: colors.primary,
      marginTop: 6,
      fontWeight: '600',
    },
  });
}