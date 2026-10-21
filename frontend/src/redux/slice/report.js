import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  counts: {
    total: 0,
    completed: 0,
    completionRate: 0,
    overdue: 0,
  },
  completionTrend: [],
  statusChart: [],
  loading: false,
  error: '',
}

const reportSlice = createSlice({
  name: 'report',
  initialState,
  reducers: {
    setReportLoading(state, action) {
      state.loading = Boolean(action.payload)
    },
    setReportError(state, action) {
      state.error = action.payload || ''
    },
    setReportData(state, action) {
      state.counts = action.payload.counts
      state.completionTrend = action.payload.completionTrend
      state.statusChart = action.payload.statusChart
      state.error = ''
    },
  },
})

export const {
  setReportData,
  setReportError,
  setReportLoading,
} = reportSlice.actions

export const selectReportState = (state) => state.report

export default reportSlice.reducer
