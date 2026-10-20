import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { initialData, storage, wait } from '../services/storage'

const asyncPersist = (type, key) => createAsyncThunk(type, async (value) => wait(storage.save(key, value)))
export const persistTasks = asyncPersist('workspace/persistTasks', 'tasks')
export const persistProjects = asyncPersist('workspace/persistProjects', 'projects')
export const persistTeam = asyncPersist('workspace/persistTeam', 'team')

const slice = createSlice({
  name: 'workspace',
  initialState: { ...initialData, loading: false, error: null },
  reducers: {
    addTask(state, action) { state.tasks.unshift(action.payload); storage.save('tasks', state.tasks) },
    updateTask(state, action) { const i = state.tasks.findIndex((item) => item.id === action.payload.id); if (i >= 0) state.tasks[i] = { ...state.tasks[i], ...action.payload }; storage.save('tasks', state.tasks) },
    deleteTask(state, action) { state.tasks = state.tasks.filter((item) => item.id !== action.payload); storage.save('tasks', state.tasks) },
    moveTask(state, action) { const task = state.tasks.find((item) => item.id === action.payload.id); if (task) task.status = action.payload.status; storage.save('tasks', state.tasks) },
    addComment(state, action) { const task = state.tasks.find((item) => item.id === action.payload.taskId); if (task) task.comments.push(action.payload.comment); storage.save('tasks', state.tasks) },
    toggleChecklist(state, action) { const task = state.tasks.find((item) => item.id === action.payload.taskId); const check = task?.checklist.find((item) => item.id === action.payload.itemId); if (check) check.completed = !check.completed; storage.save('tasks', state.tasks) },
    addProject(state, action) { state.projects.unshift(action.payload); storage.save('projects', state.projects) },
    updateProject(state, action) { const i = state.projects.findIndex((item) => item.id === action.payload.id); if (i >= 0) state.projects[i] = { ...state.projects[i], ...action.payload }; storage.save('projects', state.projects) },
    deleteProject(state, action) { state.projects = state.projects.filter((item) => item.id !== action.payload); state.tasks = state.tasks.filter((item) => item.projectId !== action.payload); storage.save('projects', state.projects); storage.save('tasks', state.tasks) },
    addMember(state, action) { state.team.push(action.payload); storage.save('team', state.team) },
    updateMember(state, action) { const i = state.team.findIndex((item) => item.id === action.payload.id); if (i >= 0) state.team[i] = { ...state.team[i], ...action.payload }; storage.save('team', state.team) },
    deleteMember(state, action) { state.team = state.team.filter((item) => item.id !== action.payload); storage.save('team', state.team) },
    updateProfile(state, action) { state.profile = { ...state.profile, ...action.payload }; storage.save('profile', state.profile) },
    resetWorkspace(state) { storage.clear(); return { ...state, ...initialData } },
  },
  extraReducers: (builder) => builder
    .addMatcher((a) => a.type.startsWith('workspace/persist') && a.type.endsWith('/pending'), (state) => { state.loading = true })
    .addMatcher((a) => a.type.startsWith('workspace/persist') && a.type.endsWith('/fulfilled'), (state) => { state.loading = false })
    .addMatcher((a) => a.type.startsWith('workspace/persist') && a.type.endsWith('/rejected'), (state, action) => { state.loading = false; state.error = action.error.message }),
})

export const { addTask, updateTask, deleteTask, moveTask, addComment, toggleChecklist, addProject, updateProject, deleteProject, addMember, updateMember, deleteMember, updateProfile, resetWorkspace } = slice.actions
export default slice.reducer
