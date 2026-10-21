import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  teamList: true,
  teamSubmit: false,
  teamDelete: false,
  projectList: false,
  projectDetail: false,
  projectSubmit: false,
  projectDelete: false,
  taskList: false,
  taskDetail: false,
  taskSubmit: false,
  taskDelete: false,
  todoUpdate: false,
  profileTasks: false,
  profileProjects: false,
  profileActivity: false,
}

const loaderSlice = createSlice({
  name: 'loader',
  initialState,
  reducers: {
    setLoader: (state, action) => {
      const { key, value } = action.payload
      if (Object.hasOwn(state, key)) state[key] = Boolean(value)
    },
    resetLoaders: () => initialState,
  },
})

export const { resetLoaders, setLoader } = loaderSlice.actions
export const selectLoader = (key) => (state) => Boolean(state.loader[key])

export default loaderSlice.reducer
