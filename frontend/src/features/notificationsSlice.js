import { createSlice } from '@reduxjs/toolkit'

const initialState = { items: [
  { id: 'n1', title: 'Task assigned', message: 'Design homepage UI is assigned to you.', read: false, time: '5m' },
  { id: 'n2', title: 'Due date approaching', message: 'Develop authentication is due soon.', read: false, time: '1h' },
  { id: 'n3', title: 'Comment added', message: 'Ali commented on Website Redesign.', read: true, time: '3h' },
] }
const slice = createSlice({ name: 'notifications', initialState, reducers: {
  markAllRead(state) { state.items.forEach((item) => { item.read = true }) },
  removeNotification(state, action) { state.items = state.items.filter((item) => item.id !== action.payload) },
} })
export const { markAllRead, removeNotification } = slice.actions
export default slice.reducer
