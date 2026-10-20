import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/authSlice'
import workspaceReducer from '../features/workspaceSlice'
import uiReducer from '../features/uiSlice'
import notificationsReducer from '../features/notificationsSlice'

export const store = configureStore({
  reducer: { auth: authReducer, workspace: workspaceReducer, ui: uiReducer, notifications: notificationsReducer },
})
