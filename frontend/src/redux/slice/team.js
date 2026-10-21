import { createSlice } from '@reduxjs/toolkit'
import { initialTeam } from '../../service/storage'

const initialState = {
  rows: initialTeam,
  error: '',
}

const teamSlice = createSlice({
  name: 'team',
  initialState,
  reducers: {
    setTeamRows: (state, action) => {
      state.rows = action.payload
      state.error = ''
    },
    removeTeamRow: (state, action) => {
      state.rows = state.rows.filter((member) => member.id !== action.payload)
    },
    setTeamError: (state, action) => {
      state.error = action.payload
    },
    resetTeam: () => initialState,
  },
})

export const { removeTeamRow, resetTeam, setTeamError, setTeamRows } = teamSlice.actions
export const selectTeamState = (state) => state.team
export const selectTeamRows = (state) => state.team.rows

export default teamSlice.reducer
