import { createSlice } from '@reduxjs/toolkit'
import { initialData } from '../../service/storage'

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState: {
    ...initialData,
    loading: false,
    error: null,
    projectError: '',
    taskError: '',
  },
  reducers: {
    addTask(state, action) {
      state.tasks.unshift(action.payload)
    },
    updateTask(state, action) {
      const index = state.tasks.findIndex((item) => item.id === action.payload.id)
      if (index >= 0) state.tasks[index] = { ...state.tasks[index], ...action.payload }
    },
    setTasks(state, action) {
      state.tasks = action.payload
      state.taskError = ''
    },
    setTaskDetails(state, action) {
      const index = state.tasks.findIndex((item) => item.id === action.payload.id)
      if (index >= 0) state.tasks[index] = { ...state.tasks[index], ...action.payload }
      else state.tasks.unshift(action.payload)
      state.taskError = ''
    },
    setTaskError(state, action) {
      state.taskError = action.payload || ''
    },
    deleteTask(state, action) {
      state.tasks = state.tasks.filter((item) => item.id !== action.payload)
    },
    moveTask(state, action) {
      const task = state.tasks.find((item) => item.id === action.payload.id)
      if (task) task.status = action.payload.status
    },
    addComment(state, action) {
      const task = state.tasks.find((item) => item.id === action.payload.taskId)
      if (task) task.comments.push(action.payload.comment)
    },
    toggleChecklist(state, action) {
      const task = state.tasks.find((item) => item.id === action.payload.taskId)
      const item = task?.checklist.find((entry) => entry.id === action.payload.itemId)
      if (item) item.completed = !item.completed
    },
    addProject(state, action) {
      state.projects.unshift(action.payload)
    },
    setProjects(state, action) {
      state.projects = action.payload
      state.projectError = ''
    },
    setProjectDetails(state, action) {
      const { project, tasks } = action.payload
      const index = state.projects.findIndex((item) => item.id === project.id)
      if (index >= 0) state.projects[index] = { ...state.projects[index], ...project }
      else state.projects.unshift(project)
      state.tasks = [
        ...state.tasks.filter((task) => task.projectId !== project.id),
        ...tasks,
      ]
      state.projectError = ''
    },
    setProjectError(state, action) {
      state.projectError = action.payload || ''
    },
    updateProject(state, action) {
      const index = state.projects.findIndex((item) => item.id === action.payload.id)
      if (index >= 0) state.projects[index] = { ...state.projects[index], ...action.payload }
    },
    deleteProject(state, action) {
      state.projects = state.projects.filter((item) => item.id !== action.payload)
      state.tasks = state.tasks.filter((item) => item.projectId !== action.payload)
    },
    updateProfile(state, action) {
      state.profile = { ...state.profile, ...action.payload }
    },
    resetWorkspace() {
      return {
        ...initialData,
        loading: false,
        error: null,
        projectError: '',
        taskError: '',
      }
    },
  },
})

export const {
  addTask,
  updateTask,
  setTasks,
  setTaskDetails,
  setTaskError,
  deleteTask,
  moveTask,
  addComment,
  toggleChecklist,
  addProject,
  setProjects,
  setProjectDetails,
  setProjectError,
  updateProject,
  deleteProject,
  updateProfile,
  resetWorkspace,
} = workspaceSlice.actions

export const selectWorkspace = (state) => state.workspace
export default workspaceSlice.reducer
