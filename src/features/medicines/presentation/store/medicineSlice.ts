import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { generateId } from '../../../../core/utils/ids';
import {
  getCreateMedicineUseCase,
  getMedicinesUseCase,
  getRemoveMedicineUseCase,
  getSaveMedicineAndScheduleUseCase,
} from '../../../../core/di/useCases';
import type { Medicine } from '../../domain/entities/Medicine';
import type { ReminderDraft } from '../../../reminders/domain/entities/ReminderDraft';

export interface SaveMedicineParams {
  medicine: Omit<Medicine, 'id' | 'createdAt'>;
  reminder: ReminderDraft | null;
}

interface MedicinesState {
  items: Medicine[];
  loading: boolean;
  saving: boolean;
  error: string | null;
}

const initialState: MedicinesState = {
  items: [],
  loading: false,
  saving: false,
  error: null,
};

export const fetchMedicines = createAsyncThunk<
  Medicine[],
  void,
  { rejectValue: string }
>('medicines/fetchAll', async (_, { rejectWithValue }) => {
  const result = await getMedicinesUseCase().execute();
  if (result.kind === 'left') {
    return rejectWithValue(result.value.message);
  }
  return result.value;
});

export const saveMedicineAndSchedule = createAsyncThunk<
  Medicine,
  SaveMedicineParams,
  { rejectValue: string }
>('medicines/saveAndSchedule', async (params, { rejectWithValue }) => {
  if (params.reminder) {
    const result = await getSaveMedicineAndScheduleUseCase().execute({
      medicine: params.medicine,
      reminder: params.reminder,
    });
    if (result.kind === 'left') {
      return rejectWithValue(result.value.message);
    }
    return result.value.medicine;
  }

  // Sin recordatorios: solo se persiste el medicamento.
  const medicine: Medicine = {
    ...params.medicine,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  const result = await getCreateMedicineUseCase().execute(medicine);
  if (result.kind === 'left') {
    return rejectWithValue(result.value.message);
  }
  return result.value;
});

export const removeMedicine = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('medicines/remove', async (medicineId, { rejectWithValue }) => {
  const result = await getRemoveMedicineUseCase().execute(medicineId);
  if (result.kind === 'left') {
    return rejectWithValue(result.value.message);
  }
  return medicineId;
});

const medicinesSlice = createSlice({
  name: 'medicines',
  initialState,
  reducers: {
    upsertMedicine(state, action: PayloadAction<Medicine>) {
      const index = state.items.findIndex(item => item.id === action.payload.id);
      if (index >= 0) {
        state.items[index] = action.payload;
      } else {
        state.items.unshift(action.payload);
      }
      state.error = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchMedicines.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMedicines.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchMedicines.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'No se pudieron cargar los medicamentos.';
      })
      .addCase(saveMedicineAndSchedule.pending, state => {
        state.saving = true;
        state.error = null;
      })
      .addCase(saveMedicineAndSchedule.fulfilled, (state, action) => {
        state.saving = false;
        medicinesSlice.caseReducers.upsertMedicine(state, action);
      })
      .addCase(saveMedicineAndSchedule.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload ?? 'No se pudo guardar el medicamento.';
      })
      .addCase(removeMedicine.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
        state.error = null;
      })
      .addCase(removeMedicine.rejected, (state, action) => {
        state.error = action.payload ?? 'No se pudo eliminar el medicamento.';
      });
  },
});

export const { upsertMedicine, clearError } = medicinesSlice.actions;
export default medicinesSlice.reducer;