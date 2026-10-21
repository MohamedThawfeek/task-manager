import { createSlice } from '@reduxjs/toolkit'

const preferredDark = localStorage.getItem('taskflow_theme') === 'dark'

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    theme: preferredDark ? 'dark' : 'light',
    sidebarOpen: false,
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
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen
    },
    closeSidebar(state) {
      state.sidebarOpen = false
    },
  },
})

export const { toggleTheme, setTheme, toggleSidebar, closeSidebar } = uiSlice.actions
export default uiSlice.reducer
