import { configureStore } from '@reduxjs/toolkit'
import filtersReducer from './slices/filtersSlice'
import authReducer from './slices/authSlice'
import operationsReducer from './slices/operationsSlice'
import bloodlosscalcReducer from './slices/bloodlosscalcSlice'

export const store = configureStore({
  reducer: {
    filters: filtersReducer,
    auth: authReducer,
    operations: operationsReducer,
    bloodlosscalc: bloodlosscalcReducer,
  },
  devTools: import.meta.env.MODE !== 'production',
})

// Правильные типы для TypeScript
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch