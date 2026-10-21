import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  counts: {
    total: 0,
    completed: 0,
    inProgress: 0,
    overdue: 0,
  },
  projects: [],
  recentTasks: [],
  upcomingTasks: [],
  completionTrend: [],
  statusChart: [],
  loading: false,
  error: '',
}

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setDashboardLoading(state, action) {
      state.loading = Boolean(action.payload)
    },
    setDashboardError(state, action) {
      state.error = action.payload || ''
    },
    setDashboardData(state, action) {
      const data = action.payload
      state.counts = data.counts
      state.projects = data.projects
      state.recentTasks = data.recentTasks
      state.upcomingTasks = data.upcomingTasks
      state.completionTrend = data.completionTrend
      state.statusChart = data.statusChart
      state.error = ''
    },
  },
})

export const {
  setDashboardData,
  setDashboardError,
  setDashboardLoading,
} = dashboardSlice.actions

export const selectDashboardState = (state) => state.dashboard

export default dashboardSlice.reducer
