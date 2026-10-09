import React, { useMemo, useState } from 'react';
import {
  Alert,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { launchCamera, type Asset } from 'react-native-image-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../../app/navigation/types';
import { getScanMedicineUseCase } from '../../../../core/di/useCases';
import { AppButton } from '../../../../app/ui/components';
import { useTheme, type PaletteColors } from '../../../../app/ui/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ScanMedicine'>;

async function hasCameraPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      {
        title: 'Permiso de cámara',
        message:
          'MobiMed usa la cámara para escanear la caja de tu medicamento y reconocer su nombre y dosis.',
        buttonPositive: 'Permitir',
        buttonNegative: 'Cancelar',
      },
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }
  return true;
}

export default function ScanMedicineScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [analyzing, setAnalyzing] = useState(false);

  async function takePhoto() {
    const granted = await hasCameraPermission();
    if (!granted) {
      Alert.alert(
        'Permiso denegado',
        'Sin acceso a la cámara no puedes escanear la caja.',
      );
      return;
    }

    setAnalyzing(true);
    try {
      const response = await launchCamera({
        mediaType: 'photo',
        includeBase64: false,
        saveToPhotos: false,
        quality: 0.9,
      });

      if (response.didCancel) {
        return;
      }
      if (response.errorCode) {
        Alert.alert('Error de cámara', response.errorMessage ?? response.errorCode);
        return;
      }

      const asset: Asset | undefined = response.assets?.[0];
      if (!asset?.uri) {
        Alert.alert('Sin imagen', 'No se obtuvo ninguna imagen capturada.');
        return;
      }

      const result = await getScanMedicineUseCase().execute(asset.uri);
      if (result.kind === 'left') {
        Alert.alert('No se pudo escanear', result.value.message);
        return;
      }

      const scanned = result.value;
      navigation.navigate('RegisterMedicine', {
        scanned: {
          name: scanned.name,
          dosage: scanned.dosage,
          presentation: scanned.presentation,
          photoPath: scanned.photoPath,
        },
      });
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'No se pudo escanear la imagen.',
      );
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <Text style={styles.title}>Escanea la caja del medicamento</Text>
        <Text style={styles.subtitle}>
          Tomaremos una foto de la caja o del prospecto y reconoceremos el
          nombre y la dosis automáticamente con OCR (Google ML Kit).
        </Text>

        <View style={styles.graphic}>
          <Text style={styles.graphicEmoji}>📷</Text>
          <Text style={styles.graphicText}>
            Coloca la caja en un lugar con buena iluminación y sin reflejos.
          </Text>
        </View>

        <View style={styles.actions}>
          <AppButton
            label="Tomar foto de la caja"
            onPress={takePhoto}
            loading={analyzing}
            disabled={analyzing}
          />
          <AppButton
            label="Prefiero escribirlo manualmente"
            variant="outline"
            onPress={() => navigation.navigate('RegisterMedicine', { scanned: undefined })}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

function createStyles(colors: PaletteColors) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    content: { flex: 1, padding: 20, justifyContent: 'center' },
    title: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.text,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 14,
      color: colors.textMuted,
      textAlign: 'center',
      marginTop: 8,
      lineHeight: 20,
    },
    graphic: {
      alignItems: 'center',
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      padding: 24,
      marginVertical: 28,
    },
    graphicEmoji: { fontSize: 54 },
    graphicText: {
      fontSize: 13,
      color: colors.textMuted,
      textAlign: 'center',
      marginTop: 12,
    },
    actions: { gap: 10 },
  });
}