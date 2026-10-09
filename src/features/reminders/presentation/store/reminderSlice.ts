import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import {
  getCancelReminderUseCase,
  getRemindersForMedicineUseCase,
} from '../../../../core/di/useCases';
import type { Reminder } from '../../domain/entities/Reminder';
import type { ReminderDraft } from '../../domain/entities/ReminderDraft';

interface RemindersState {
  items: Reminder[];
  loading: boolean;
  error: string | null;
  /** Borrador de recordatorios en construcción (flujo de registro). */
  draft: ReminderDraft | null;
}

const initialState: RemindersState = {
  items: [],
  loading: false,
  error: null,
  draft: null,
};

export const fetchRemindersForMedicine = createAsyncThunk<
  Reminder[],
  string,
  { rejectValue: string }
>('reminders/fetchForMedicine', async (medicineId, { rejectWithValue }) => {
  const result = await getRemindersForMedicineUseCase().execute(medicineId);
  if (result.kind === 'left') {
    return rejectWithValue(result.value.message);
  }
  return result.value;
});

export const cancelReminder = createAsyncThunk<
  Reminder | null,
  string,
  { rejectValue: string }
>('reminders/cancel', async (reminderId, { rejectWithValue }) => {
  const result = await getCancelReminderUseCase().execute(reminderId);
  if (result.kind === 'left') {
    return rejectWithValue(result.value.message);
  }
  return result.value;
});

const remindersSlice = createSlice({
  name: 'reminders',
  initialState,
  reducers: {
    clear(state) {
      state.items = [];
      state.error = null;
    },
    setDraft(state, action: PayloadAction<ReminderDraft | null>) {
      state.draft = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchRemindersForMedicine.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRemindersForMedicine.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchRemindersForMedicine.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'No se pudieron cargar los recordatorios.';
      })
      .addCase(cancelReminder.fulfilled, (state, action) => {
        state.error = null;
        if (action.payload) {
          const index = state.items.findIndex(
            item => item.id === action.payload!.id,
          );
          if (index >= 0) {
            state.items[index] = action.payload;
          }
        } else {
          state.items = state.items.filter(
            item => item.id !== action.meta.arg,
          );
        }
      })
      .addCase(cancelReminder.rejected, (state, action) => {
        state.error = action.payload ?? 'No se pudo cancelar el recordatorio.';
      });
  },
});

export const { clear: clearReminders, setDraft } = remindersSlice.actions;
export default remindersSlice.reducer;