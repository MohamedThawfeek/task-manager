import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  items: [],
}

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotifications(state, action) {
      state.items = action.payload
    },
    markAllRead(state) {
      state.items.forEach((item) => {
        item.read = true
      })
    },
    removeNotification(state, action) {
      state.items = state.items.filter((item) => item.id !== action.payload)
    },
  },
})

export const { markAllRead, removeNotification, setNotifications } = notificationsSlice.actions
export default notificationsSlice.reducer
