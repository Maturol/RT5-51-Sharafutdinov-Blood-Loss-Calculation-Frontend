// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit'
import filtersReducer from './slices/filtersSlice'

export const store = configureStore({
  reducer: {
    filters: filtersReducer,
  },
  devTools: import.meta.env.MODE !== 'production', // Используем Vite env переменные
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch