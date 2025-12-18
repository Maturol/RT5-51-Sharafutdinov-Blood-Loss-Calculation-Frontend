import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '../../api'
import { type HandlerAuthRequest, type HandlerRegisterRequest } from '../../api/Api'

interface User {
  user_id: number | null
  username: string
  is_moderator: boolean
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
}

// Функция для безопасного преобразования
const transformUser = (userData: any): User | null => {
  if (!userData) return null
  
  return {
    user_id: userData.user_id ?? null,
    username: userData.username ?? '',
    is_moderator: userData.is_moderator ?? false
  }
}

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: HandlerAuthRequest, { rejectWithValue }) => {
    try {
      const response = await api.api.authCreate(credentials)
      const { token, user } = response.data
      
      // Безопасное преобразование
      const transformedUser = transformUser(user)

      if (token) {
        localStorage.setItem('token', token)
      }
      
      return {
        token: token || null,
        user: transformedUser
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.description || 'Ошибка авторизации')
    }
  }
)

export const registerUser = createAsyncThunk(
  'auth/register',
  async (credentials: HandlerRegisterRequest, { rejectWithValue }) => {
    try {
      const response = await api.api.registerCreate(credentials)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.description || 'Ошибка регистрации')
    }
  }
)

export const updateUserProfile = createAsyncThunk(
  'auth/updateProfile',
  async (
    updates: { username?: string; password?: string }, 
    { rejectWithValue }
  ) => {
    try {
      const response = await api.api.userUpdate(updates)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.description || 'Ошибка обновления профиля')
    }
  }
)

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      await api.api.logoutCreate().catch(() => {
        // Игнорируем ошибки логаута
      })

      localStorage.removeItem('token')
      
      return null
    } catch (error: any) {
      localStorage.removeItem('token')
      return rejectWithValue(error.response?.data?.description || 'Ошибка выхода')
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.isAuthenticated = true
        state.token = action.payload.token
        state.user = action.payload.user
        state.error = null
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.isAuthenticated = false
        state.error = action.payload as string
      })
      
      .addCase(registerUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false
        state.error = null
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null
        state.token = null
        state.isAuthenticated = false
        state.error = null

        localStorage.clear()
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.user = null
        state.token = null
        state.isAuthenticated = false
        state.error = action.payload as string
      })

      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false
        state.error = null
        
        if (action.payload.user) {
          state.user = transformUser(action.payload.user)
          
          localStorage.setItem('user', JSON.stringify(state.user))
        }
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { clearError } = authSlice.actions
export default authSlice.reducer