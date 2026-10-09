import {
  createAsyncThunk,
  createSlice,
} from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

/** Preferencia de tema del usuario: seguir el sistema o forzar claro/oscuro. */
export type ThemePreference = 'system' | 'light' | 'dark';

const STORAGE_KEY = '@mobimed/theme';

interface ThemeState {
  /** Preferencia elegida por el usuario (persistida en AsyncStorage). */
  preference: ThemePreference;
  /** `true` cuando ya se recuperó la preferencia al arrancar. */
  hydrated: boolean;
}

const initialState: ThemeState = {
  preference: 'system',
  hydrated: false,
};

function isThemePreference(value: unknown): value is ThemePreference {
  return value === 'system' || value === 'light' || value === 'dark';
}

/** Recupera la preferencia persistida al arrancar la app. */
export const loadThemePreference = createAsyncThunk<ThemePreference>(
  'theme/load',
  async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      return isThemePreference(raw) ? raw : 'system';
    } catch {
      return 'system';
    }
  },
);

/** Persiste la nueva preferencia y la aplica al estado global. */
export const updateThemePreference = createAsyncThunk<
  ThemePreference,
  ThemePreference
>('theme/update', async preference => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, preference);
  } catch {
    // La persistencia no debe bloquear el cambio en sesión actual.
  }
  return preference;
});

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(loadThemePreference.fulfilled, (state, action) => {
        state.preference = action.payload;
        state.hydrated = true;
      })
      .addCase(updateThemePreference.fulfilled, (state, action) => {
        state.preference = action.payload;
      });
  },
});

export default themeSlice.reducer;