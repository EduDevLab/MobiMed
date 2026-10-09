import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
import medicinesReducer from '../features/medicines/presentation/store/medicineSlice';
import remindersReducer from '../features/reminders/presentation/store/reminderSlice';
import themeReducer from '../core/theme/themeSlice';

export const store = configureStore({
  reducer: {
    medicines: medicinesReducer,
    reminders: remindersReducer,
    theme: themeReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;