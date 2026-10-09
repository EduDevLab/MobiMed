import React, { useCallback, useEffect, useMemo } from 'react';
import {
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../../app/navigation/types';
import { useAppDispatch, useAppSelector } from '../../../../app/store';
import { fetchMedicines } from '../store/medicineSlice';
import type { Medicine } from '../../domain/entities/Medicine';
import { AppButton, ErrorBanner } from '../../../../app/ui/components';
import { Logo } from '../../../../app/ui/Logo';
import { useTheme, type PaletteColors } from '../../../../app/ui/theme';
import { toDateOnly } from '../../../../core/utils/dates';

type Props = NativeStackScreenProps<RootStackParamList, 'MedicineList'>;

export default function MedicineListScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const dispatch = useAppDispatch();
  const { items, loading, error } = useAppSelector(state => state.medicines);
  const reminders = useAppSelector(state => state.reminders.items);

  useEffect(() => {
    if (!loading) {
      dispatch(fetchMedicines());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: Medicine }) => (
      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        onPress={() =>
          navigation.navigate('MedicineDetail', { medicineId: item.id })
        }>
        <View style={styles.cardHeader}>
          <Text style={styles.cardName}>{item.name}</Text>
          <Text style={styles.cardDosage}>
            {item.dosage ? item.dosage : '—'}
          </Text>
        </View>
        <Text style={styles.cardMeta}>{item.presentation}</Text>
        <View style={styles.cardFooter}>
          <Text style={styles.cardDate}>
            Registrado: {toDateOnly(new Date(item.createdAt))}
          </Text>
          <Text style={styles.cardReminders}>
            {reminders.filter(r => r.medicineId === item.id).length} recordatorios
          </Text>
        </View>
      </Pressable>
    ),
    [navigation, reminders, styles],
  );

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={items}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            <View style={styles.brand}>
              <Logo size="md" />
            </View>
            <ErrorBanner message={error} />
          </>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Aún no tienes medicamentos</Text>
            <Text style={styles.emptyText}>
              Registra tu primer medicamento escaneando la caja con la cámara
              o escribiéndolo manualmente.
            </Text>
          </View>
        }
      />
      <View style={styles.actions}>
        <AppButton
          label="Escanear caja"
          variant="outline"
          onPress={() => navigation.navigate('ScanMedicine')}
          style={styles.actionButton}
        />
        <AppButton
          label="+ Registrar medicamento"
          onPress={() =>
            navigation.navigate('RegisterMedicine', { scanned: undefined })
          }
          style={styles.actionButton}
        />
      </View>
    </SafeAreaView>
  );
}

function createStyles(colors: PaletteColors) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    listContent: { padding: 16, paddingBottom: 140 },
    brand: {
      alignItems: 'center',
      marginBottom: 14,
      paddingTop: 6,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 14,
      marginBottom: 10,
    },
    cardPressed: { opacity: 0.85 },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    cardName: { fontSize: 16, fontWeight: '700', color: colors.text, flex: 1 },
    cardDosage: { fontSize: 13, color: colors.primary, fontWeight: '600' },
    cardMeta: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
    cardFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 10,
    },
    cardDate: { fontSize: 12, color: colors.textMuted },
    cardReminders: { fontSize: 12, color: colors.textMuted },
    empty: { alignItems: 'center', marginTop: 48, paddingHorizontal: 24 },
    emptyTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
    emptyText: {
      fontSize: 14,
      color: colors.textMuted,
      textAlign: 'center',
      marginTop: 8,
      lineHeight: 20,
    },
    actions: {
      position: 'absolute',
      left: 16,
      right: 16,
      bottom: 20,
      flexDirection: 'row',
      gap: 10,
    },
    actionButton: { flex: 1 },
  });
}