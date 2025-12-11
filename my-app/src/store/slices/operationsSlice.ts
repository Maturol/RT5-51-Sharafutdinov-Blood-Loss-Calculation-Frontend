import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import { api } from '../../api'
import { type HandlerOperation } from '../../api/Api'
import type { RootState } from '../index' // Импортируй тип корневого состояния

interface OperationsState {
  operations: HandlerOperation[]
  loading: boolean
  error: string | null
  searchTerm: string
}

const initialState: OperationsState = {
  operations: [],
  loading: false,
  error: null,
  searchTerm: '',
}

export const fetchOperations = createAsyncThunk<
  HandlerOperation[], // Тип возвращаемого значения
  void, // Тип аргумента
  {
    state: RootState
    rejectValue: string
  }
>(
  'operations/fetch',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState()
      const searchTerm = state.operations.searchTerm
      
      const params: any = {}
      if (searchTerm) params.title = searchTerm
      
      const response = await api.api.operationsList(params, { secure: false })
      
      // Бэкенд возвращает данные с заглавными ключами, трансформируем
      const rawOperations = response.data.operations || []
      
      // Трансформируем данные из бэкенд формата в фронтенд формат
      const transformedOperations = rawOperations.map((op: any) => ({
        id: op.ID,           // Большая ID → маленькая id
        title: op.Title,
        description: op.Description,
        status: op.Status,
        image_url: op.ImageURL,
        blood_loss_coeff: op.BloodLossCoeff,
        avg_blood_loss: op.AvgBloodLoss
      }))
      
      return transformedOperations
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.description || 'Ошибка загрузки операций')
    }
  }
)

export const addToCart = createAsyncThunk<
  any, // Тип возвращаемого значения
  { operationId: number }, // Тип аргумента
  {
    state: RootState
    rejectValue: string
  }
>(
  'operations/addToCart',
  async ({ operationId }, { rejectWithValue }) => {
    try {
      const response = await api.api.operationsAddToBloodlosscalcCreate(
        operationId,
        {}
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.description || 'Ошибка добавления в заявку')
    }
  }
)

const operationsSlice = createSlice({
  name: 'operations',
  initialState,
  reducers: {
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload
    },
    clearSearch: (state) => {
      state.searchTerm = ''
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOperations.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchOperations.fulfilled, (state, action: PayloadAction<HandlerOperation[]>) => {
        state.loading = false
        state.operations = action.payload
        state.error = null
      })
      .addCase(fetchOperations.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { setSearchTerm, clearSearch } = operationsSlice.actions
export default operationsSlice.reducer