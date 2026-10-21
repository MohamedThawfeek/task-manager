import { createSlice } from '@reduxjs/toolkit'
import { loadStoredAuth } from '../../service/authStorage'

const saved = loadStoredAuth()

const initialState = {
  user: saved?.user || null,
  token: saved?.token || null,
  remember: Boolean(saved?.remember),
  loading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth(state, action) {
      state.user = action.payload.user
      state.token = action.payload.token
      state.remember = Boolean(action.payload.remember)
      state.error = null
    },
    setAuthLoading(state, action) {
      state.loading = Boolean(action.payload)
    },
    setAuthError(state, action) {
      state.error = action.payload || null
    },
    logout() {
      return { ...initialState, user: null, token: null, remember: false }
    },
    syncUser(state, action) {
      state.user = { ...(state.user || {}), ...action.payload }
    },
  },
})

export const { logout, setAuth, setAuthError, setAuthLoading, syncUser } = authSlice.actions
export default authSlice.reducer
