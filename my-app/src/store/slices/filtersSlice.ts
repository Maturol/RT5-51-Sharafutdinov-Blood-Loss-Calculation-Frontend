// src/store/slices/filtersSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface FiltersState {
  searchTerm: string
}

const initialState: FiltersState = {
  searchTerm: '',
}

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload
    },
    clearFilters: (state) => {
      state.searchTerm = ''
    },
  },
})

// Убираем экспорт setStatusFilter
export const { setSearchTerm, clearFilters } = filtersSlice.actions
export default filtersSlice.reducer