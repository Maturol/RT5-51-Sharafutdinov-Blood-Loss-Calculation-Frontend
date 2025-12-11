import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '../../api'
import { 
  type HandlerBloodlosscalcDetailResponse, 
  type HandlerBloodlosscalcResponse,
  type HandlerCartInfoResponse
} from '../../api/Api'

interface BloodlosscalcState {
  currentRequest: any | null
  requests: HandlerBloodlosscalcResponse[]
  currentRequestDetail: HandlerBloodlosscalcDetailResponse | null
  loading: boolean
  error: string | null
  cartInfo: HandlerCartInfoResponse
}

const initialState: BloodlosscalcState = {
  currentRequest: null,
  requests: [],
  currentRequestDetail: null,
  loading: false,
  error: null,
  cartInfo: {
    current_request_id: 0,
    service_count: 0,
  },
}

// Используем сгенерированный метод для получения информации о корзине
export const fetchCartInfo = createAsyncThunk(
  'bloodlosscalc/fetchCartInfo',
  async (_, { rejectWithValue, getState }) => {
    try {
      const response = await api.api.operationcartList()
      return response.data
    } catch (error: any) {
      
      // Если 401 - пользователь не авторизован, возвращаем пустую корзину
      if (error.response?.status === 401) {
        return {
          current_request_id: 0,
          service_count: 0,
        }
      }
      
      return rejectWithValue(error.response?.data?.description || 'Ошибка загрузки корзины')
    }
  }
)

// Используем сгенерированный метод для получения всех заявок
export const fetchBloodlosscalcs = createAsyncThunk(
  'bloodlosscalc/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.api.bloodlosscalcsList()
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.description || 'Ошибка загрузки заявок')
    }
  }
)

// Используем сгенерированный метод для получения заявки по ID
export const fetchBloodlosscalcById = createAsyncThunk(
  'bloodlosscalc/fetchById',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await api.api.bloodlosscalcsDetail(id)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.description || 'Ошибка загрузки заявки')
    }
  }
)

// Используем сгенерированный метод для формирования заявки
export const formBloodlosscalc = createAsyncThunk(
  'bloodlosscalc/form',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await api.api.bloodlosscalcsFormUpdate(id)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.description || 'Ошибка формирования заявки')
    }
  }
)

// Используем сгенерированный метод для удаления заявки
export const deleteBloodlosscalc = createAsyncThunk(
  'bloodlosscalc/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await api.api.bloodlosscalcsDelete(id)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.description || 'Ошибка удаления заявки')
    }
  }
)

// Удаление операции из заявки
export const removeOperationFromBloodlosscalc = createAsyncThunk(
  'bloodlosscalc/removeOperation',
  async (
    { bloodlosscalcId, operationId }: { bloodlosscalcId: number; operationId: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.api.bloodlosscalcOperationsDelete({
        bloodlosscalc_id: bloodlosscalcId,
        operation_id: operationId,
      })
      return { bloodlosscalcId, operationId, message: response.data.message }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.description || 'Ошибка удаления операции из заявки')
    }
  }
)

// Обновление операции в заявке (для изменения параметров)
export const updateOperationInBloodlosscalc = createAsyncThunk(
  'bloodlosscalc/updateOperation',
  async (
    {
      bloodlosscalcId,
      operationId,
      data,
    }: {
      bloodlosscalcId: number
      operationId: number
      data: any // Используем тип HandlerUpdateOperationRequest из Api.ts
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.api.bloodlosscalcOperationsUpdate(
        {
          bloodlosscalc_id: bloodlosscalcId,
          operation_id: operationId,
        },
        data
      )
      return { bloodlosscalcId, operationId, data: response.data }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.description || 'Ошибка обновления операции')
    }
  }
)

const bloodlosscalcSlice = createSlice({
  name: 'bloodlosscalc',
  initialState,
  reducers: {
    clearCurrentRequest: (state) => {
        state.currentRequestDetail = null
    },
    removeOperationLocally: (state, action) => {
        if (state.currentRequestDetail?.items) {
        state.currentRequestDetail.items = state.currentRequestDetail.items.filter(
            (_item, index) => index !== action.payload
        )
        }
    },
    resetCart: (state) => {
        state.cartInfo = {
        current_request_id: 0,
        service_count: 0,
        }
        state.currentRequestDetail = null
    },
    },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCartInfo.fulfilled, (state, action) => {
        state.cartInfo = action.payload
      })
      .addCase(fetchBloodlosscalcs.fulfilled, (state, action) => {
        state.requests = action.payload
      })
      .addCase(fetchBloodlosscalcById.fulfilled, (state, action) => {
        state.currentRequestDetail = action.payload
      })
      // Обработка удаления операции
      .addCase(removeOperationFromBloodlosscalc.fulfilled, (state, action) => {
        // После успешного удаления обновляем локальное состояние
        if (state.currentRequestDetail?.items) {
          state.currentRequestDetail.items = state.currentRequestDetail.items.filter(
            (_item, index) => index !== action.meta.arg.operationId // Здесь нужно уточнить логику фильтрации
          )
        }
        // Обновляем количество услуг в корзине
        if (state.cartInfo.service_count && state.cartInfo.service_count > 0) {
          state.cartInfo.service_count -= 1
        }
      })
  },
})

export const { clearCurrentRequest, removeOperationLocally, resetCart } = bloodlosscalcSlice.actions
export default bloodlosscalcSlice.reducer