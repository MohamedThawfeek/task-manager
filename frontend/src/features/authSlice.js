import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { profileSeed } from '../data/seed'
import { storage, wait } from '../services/storage'

const saved = storage.load('auth', null)

export const login = createAsyncThunk('auth/login', async ({ email, remember }) => {
  await wait(null, 450)
  const user = { ...profileSeed, email: email || profileSeed.email }
  const auth = { user, token: `local-${Date.now()}`, remember: !!remember }
  storage.save('auth', auth)
  return auth
})

export const register = createAsyncThunk('auth/register', async ({ name, email }) => {
  await wait(null, 500)
  const user = { ...profileSeed, name, email }
  const auth = { user, token: `local-${Date.now()}`, remember: true }
  storage.save('auth', auth)
  storage.save('profile', user)
  return auth
})

const slice = createSlice({
  name: 'auth', initialState: { user: saved?.user || null, token: saved?.token || null, loading: false, error: null },
  reducers: {
    logout(state) { state.user = null; state.token = null; localStorage.removeItem('taskflow_auth') },
    syncUser(state, action) { state.user = { ...(state.user || {}), ...action.payload }; if (state.token) storage.save('auth', { user: state.user, token: state.token, remember: true }) },
  },
  extraReducers: (builder) => builder
    .addMatcher((action) => action.type.endsWith('/pending') && action.type.startsWith('auth/'), (state) => { state.loading = true; state.error = null })
    .addMatcher((action) => action.type.endsWith('/fulfilled') && action.type.startsWith('auth/'), (state, action) => { state.loading = false; state.user = action.payload.user; state.token = action.payload.token })
    .addMatcher((action) => action.type.endsWith('/rejected') && action.type.startsWith('auth/'), (state, action) => { state.loading = false; state.error = action.error.message }),
})

export const { logout, syncUser } = slice.actions
export default slice.reducer
