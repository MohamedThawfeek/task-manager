import { createSlice } from '@reduxjs/toolkit'

const preferredDark = localStorage.getItem('taskflow_theme') === 'dark'

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    theme: preferredDark ? 'dark' : 'light',
  },
  reducers: {
    toggleTheme(state) {
      state.theme = state.theme === 'dark' ? 'light' : 'dark'
      localStorage.setItem('taskflow_theme', state.theme)
    },
    setTheme(state, action) {
      state.theme = action.payload
      localStorage.setItem('taskflow_theme', action.payload)
    },
  },
})

export const { toggleTheme, setTheme } = uiSlice.actions
export default uiSlice.reducer
