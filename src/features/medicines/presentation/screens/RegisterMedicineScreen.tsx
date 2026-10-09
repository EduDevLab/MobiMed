import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../../app/navigation/types';
import { useAppDispatch, useAppSelector } from '../../../../app/store';
import { saveMedicineAndSchedule } from '../store/medicineSlice';
import { setDraft } from '../../../reminders/presentation/store/reminderSlice';
import {
  MEDICINE_PRESENTATIONS,
  type MedicinePresentation,
} from '../../domain/entities/Medicine';
import {
  AppButton,
  Chip,
  ErrorBanner,
  FormField,
  Section,
} from '../../../../app/ui/components';
import { useTheme, type PaletteColors } from '../../../../app/ui/theme';
import { formatInterval } from '../../../../core/utils/dates';
import { getNotificationScheduler } from '../../../../core/di/useCases';

type Props = NativeStackScreenProps<RootStackParamList, 'RegisterMedicine'>;

const DAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export default function RegisterMedicineScreen({ navigation, route }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const dispatch = useAppDispatch();
  const { saving, error } = useAppSelector(state => state.medicines);
  const draft = useAppSelector(state => state.reminders.draft);

  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [presentation, setPresentation] =
    useState<MedicinePresentation>('Pastilla');
  const [photoPath, setPhotoPath] = useState<string | null>(null);
  const [requestingPermission, setRequestingPermission] = useState(false);

  // Relleno con los datos pre-llenados por el escaneo OCR.
  useEffect(() => {
    const scanned = route.params?.scanned;
    if (scanned) {
      setName(scanned.name || name);
      setDosage(scanned.dosage || dosage);
      setPresentation(scanned.presentation);
      if (scanned.photoPath) {
        setPhotoPath(scanned.photoPath);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.params?.scanned]);

  const hasDraft = draft !== null;

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert('Falta el nombre', 'Indica el nombre del medicamento.');
      return;
    }

    const medicine = {
      name: name.trim(),
      dosage: dosage.trim(),
      presentation,
      photoPath,
    };

    // Si hay recordatorios, primero solicitamos permisos de notificación.
    if (hasDraft) {
      setRequestingPermission(true);
      const permission = await getNotificationScheduler().requestPermissions();
      setRequestingPermission(false);
      if (permission.kind === 'left') {
        Alert.alert('Permiso necesario', permission.value.message);
        return;
      }
    }

    const result = await dispatch(
      saveMedicineAndSchedule({ medicine, reminder: draft }),
    );
    if (saveMedicineAndSchedule.fulfilled.match(result)) {
      dispatch(setDraft(null));
      Alert.alert('Guardado', 'Medicamento y recordatorios programados.', [
        { text: 'OK', onPress: () => navigation.navigate('MedicineList') },
      ]);
    }
  }

  function openScanner() {
    navigation.navigate('ScanMedicine');
  }

  function openReminderForm() {
    navigation.navigate('ReminderForm');
  }

  function removeDraft() {
    dispatch(setDraft(null));
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <ErrorBanner message={error} />

        {photoPath ? (
          <View style={styles.photoContainer}>
            <Image source={{ uri: photoPath }} style={styles.photo} />
            <Text style={styles.photoHint}>Foto de la caja adjuntada</Text>
          </View>
        ) : null}

        <Section title="Datos del medicamento">
          <FormField
            label="Nombre *"
            value={name}
            onChangeText={setName}
            placeholder="Ej. Amoxicilina 500mg"
          />
          <FormField
            label="Dosis / concentración"
            value={dosage}
            onChangeText={setDosage}
            placeholder="Ej. 500 mg, 10 ml…"
          />

          <Text style={styles.subLabel}>Presentación</Text>
          <View style={styles.chipRow}>
            {MEDICINE_PRESENTATIONS.map(item => (
              <Chip
                key={item}
                label={item}
                selected={presentation === item}
                onPress={() => setPresentation(item)}
              />
            ))}
          </View>
        </Section>

        <Section title="Recordatorios">
          {hasDraft && draft ? (
            <>
              <View style={styles.draftBox}>
                <Text style={styles.draftLine}>
                  Primera toma: {draft.startDatetime.replace('T', ' ')}
                </Text>
                <Text style={styles.draftLine}>
                  {formatInterval(draft.intervalMinutes)}
                </Text>
                <Text style={styles.draftLine}>
                  Días:{' '}
                  {draft.frequencyDays.map(d => DAY_LABELS[d]).join(', ')}
                </Text>
                <Text style={styles.draftLine}>
                  Hasta: {draft.endDate ?? 'sin fecha de fin (continuo)'}
                </Text>
              </View>
              <View style={styles.rowButtons}>
                <AppButton
                  label="Editar programación"
                  variant="outline"
                  onPress={openReminderForm}
                  style={styles.flex}
                />
                <AppButton
                  label="Quitar"
                  variant="ghost"
                  onPress={removeDraft}
                  style={styles.flex}
                />
              </View>
            </>
          ) : (
            <>
              <Text style={styles.draftHint}>
                Programa la fecha de la primera toma y el intervalo entre tomas
                (ej. cada 8 horas o cada 4 h 30 min) para recibir alertas
                exactas.
              </Text>
              <AppButton
                label="Programar recordatorios"
                variant="outline"
                onPress={openReminderForm}
              />
            </>
          )}
        </Section>

        <View style={styles.bottomActions}>
          <AppButton
            label="Escanear caja con la cámara"
            variant="ghost"
            onPress={openScanner}
          />
          <AppButton
            label="Guardar medicamento"
            onPress={handleSave}
            loading={saving || requestingPermission}
            disabled={saving || requestingPermission}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: PaletteColors) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    content: { padding: 16, paddingBottom: 40 },
    subLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap' },
    photoContainer: { alignItems: 'center', marginBottom: 16 },
    photo: { width: 160, height: 160, borderRadius: 10 },
    photoHint: { fontSize: 12, color: colors.textMuted, marginTop: 6 },
    draftBox: {
      backgroundColor: colors.primarySoft,
      borderRadius: 8,
      padding: 12,
      marginBottom: 10,
    },
    draftLine: { fontSize: 13, color: colors.text, paddingVertical: 2 },
    draftHint: {
      fontSize: 13,
      color: colors.textMuted,
      marginBottom: 10,
      lineHeight: 18,
    },
    rowButtons: { flexDirection: 'row', gap: 10, marginTop: 4 },
    flex: { flex: 1 },
    bottomActions: { gap: 10, marginTop: 4 },
  });
}