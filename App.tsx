/**
 * MobiMed — Sistema de Recordatorios de Medicamentos
 * Punto de composición raíz de la aplicación.
 * Clean Architecture: UI + Dominio + Datos.
 */
import React, { useEffect, useMemo } from 'react';
import { Pressable, StatusBar, StyleSheet, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  useNavigation,
} from '@react-navigation/native';
import {
  createNativeStackNavigator,
  type NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import { Provider } from 'react-redux';

import { initializeDependencies } from './src/core/di/composition';
import { store, useAppDispatch, useAppSelector } from './src/app/store';
import { ThemeProvider, useTheme } from './src/app/ui/theme';
import { loadThemePreference } from './src/core/theme/themeSlice';
import type { RootStackParamList } from './src/app/navigation/types';

import MedicineListScreen from './src/features/medicines/presentation/screens/MedicineListScreen';
import RegisterMedicineScreen from './src/features/medicines/presentation/screens/RegisterMedicineScreen';
import ScanMedicineScreen from './src/features/medicines/presentation/screens/ScanMedicineScreen';
import MedicineDetailScreen from './src/features/medicines/presentation/screens/MedicineDetailScreen';
import ReminderFormScreen from './src/features/reminders/presentation/screens/ReminderFormScreen';
import SettingsScreen from './src/features/settings/presentation/screens/SettingsScreen';

// Inicialización de dependencias (base de datos, repositorios y casos de uso).
initializeDependencies();

const Stack = createNativeStackNavigator<RootStackParamList>();

/** Estilos del engrane (⚙️) del header de Configuración. */
const headerStyles = StyleSheet.create({
  button: { paddingHorizontal: 6 },
  buttonPressed: { opacity: 0.5 },
  icon: { fontSize: 22 },
});

/** Engrane (⚙️) del header: abre la pantalla de Configuración. */
function SettingsHeaderButton() {
  const { colors } = useTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Abrir configuración"
      hitSlop={12}
      onPress={() => navigation.navigate('Settings')}
      style={({ pressed }) => [
        headerStyles.button,
        pressed && headerStyles.buttonPressed,
      ]}>
      <Text style={[headerStyles.icon, { color: colors.primary }]}>⚙️</Text>
    </Pressable>
  );
}

/** Recupera la preferencia de tema persistida y monta el navegador temático. */
function Root() {
  const dispatch = useAppDispatch();
  const themePreference = useAppSelector(state => state.theme.preference);

  useEffect(() => {
    dispatch(loadThemePreference());
  }, [dispatch]);

  return (
    <ThemeProvider preference={themePreference}>
      <AppNavigator />
    </ThemeProvider>
  );
}

function AppNavigator() {
  const { scheme, colors } = useTheme();

  // Tema de React Navigation alineado con el esquema seleccionado.
  const navigationTheme = useMemo(() => {
    const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: colors.primary,
        background: colors.background,
        card: colors.card,
        text: colors.text,
        border: colors.border,
        notification: colors.primary,
      },
    };
  }, [scheme, colors]);

  return (
    <>
      <StatusBar
        barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'}
      />
      <NavigationContainer theme={navigationTheme}>
        <Stack.Navigator>
          <Stack.Screen
            name="MedicineList"
            component={MedicineListScreen}
            options={{
              title: 'MobiMed',
              headerRight: SettingsHeaderButton,
            }}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ title: 'Configuración' }}
          />
          <Stack.Screen
            name="RegisterMedicine"
            component={RegisterMedicineScreen}
            options={{ title: 'Registrar medicamento' }}
          />
          <Stack.Screen
            name="ScanMedicine"
            component={ScanMedicineScreen}
            options={{ title: 'Escanear caja' }}
          />
          <Stack.Screen
            name="ReminderForm"
            component={ReminderFormScreen}
            options={{ title: 'Programar recordatorios' }}
          />
          <Stack.Screen
            name="MedicineDetail"
            component={MedicineDetailScreen}
            options={{ title: 'Detalle del medicamento' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

function App() {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <Root />
      </Provider>
    </SafeAreaProvider>
  );
}

export default App;