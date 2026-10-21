import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  details: {},
  tasks: [],
  projects: [],
  activities: [],
  error: '',
  tasksLoading: false,
  projectsLoading: false,
  activityLoading: false,
}

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    updateProfile(state, action) {
      state.details = { ...state.details, ...action.payload }
    },
    setProfileTasks(state, action) {
      state.tasks = action.payload
      state.error = ''
    },
    setProfileProjects(state, action) {
      state.projects = action.payload
      state.error = ''
    },
    setProfileActivities(state, action) {
      state.activities = action.payload
      state.error = ''
    },
    setProfileError(state, action) {
      state.error = action.payload || ''
    },
    setProfileTasksLoading(state, action) {
      state.tasksLoading = Boolean(action.payload)
    },
    setProfileProjectsLoading(state, action) {
      state.projectsLoading = Boolean(action.payload)
    },
    setProfileActivityLoading(state, action) {
      state.activityLoading = Boolean(action.payload)
    },
  },
})

export const {
  setProfileActivities,
  setProfileActivityLoading,
  setProfileError,
  setProfileProjects,
  setProfileProjectsLoading,
  setProfileTasks,
  setProfileTasksLoading,
  updateProfile,
} = profileSlice.actions

export const selectProfileState = (state) => state.profile

export default profileSlice.reducer
