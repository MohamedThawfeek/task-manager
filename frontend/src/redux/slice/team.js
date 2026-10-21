import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  rows: [],
  error: '',
  loading: true,
  submitting: false,
  deleting: false,
}

const teamSlice = createSlice({
  name: 'team',
  initialState,
  reducers: {
    setTeamRows(state, action) {
      state.rows = action.payload
      state.error = ''
    },
    setTeamError(state, action) {
      state.error = action.payload || ''
    },
    setTeamLoading(state, action) {
      state.loading = Boolean(action.payload)
    },
    setTeamSubmitting(state, action) {
      state.submitting = Boolean(action.payload)
    },
    setTeamDeleting(state, action) {
      state.deleting = Boolean(action.payload)
    },
  },
})

export const {
  setTeamDeleting,
  setTeamError,
  setTeamLoading,
  setTeamRows,
  setTeamSubmitting,
} = teamSlice.actions
export const selectTeamState = (state) => state.team
export const selectTeamRows = (state) => state.team.rows

export default teamSlice.reducer
