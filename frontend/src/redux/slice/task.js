import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  items: [],
  error: '',
  listLoading: false,
  detailLoading: false,
  submitting: false,
  deleting: false,
  todoUpdating: false,
  commentsLoading: false,
  commentSubmitting: false,
}

const taskSlice = createSlice({
  name: 'task',
  initialState,
  reducers: {
    setTasks(state, action) {
      state.items = action.payload
      state.error = ''
    },
    setTaskDetails(state, action) {
      const task = action.payload
      const index = state.items.findIndex((item) => item.id === task.id)

      if (index === -1) state.items.unshift(task)
      else state.items[index] = { ...state.items[index], ...task }

      state.error = ''
    },
    updateTask(state, action) {
      const task = action.payload
      const index = state.items.findIndex((item) => item.id === task.id)

      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...task }
      }
    },
    deleteTask(state, action) {
      state.items = state.items.filter((item) => item.id !== action.payload)
    },
    setProjectTasks(state, action) {
      const { projectId, tasks } = action.payload
      const otherTasks = state.items.filter((task) => task.projectId !== projectId)

      state.items = [...otherTasks, ...tasks]
    },
    removeProjectTasks(state, action) {
      state.items = state.items.filter(
        (task) => task.projectId !== action.payload,
      )
    },
    setTaskComments(state, action) {
      const task = state.items.find((item) => item.id === action.payload.taskId)
      if (task) task.comments = action.payload.comments
    },
    toggleChecklist(state, action) {
      const task = state.items.find((item) => item.id === action.payload.taskId)
      const item = task?.checklist.find(
        (entry) => entry.id === action.payload.itemId,
      )
      if (item) item.completed = !item.completed
    },
    setTaskError(state, action) {
      state.error = action.payload || ''
    },
    setTaskListLoading(state, action) {
      state.listLoading = Boolean(action.payload)
    },
    setTaskDetailLoading(state, action) {
      state.detailLoading = Boolean(action.payload)
    },
    setTaskSubmitting(state, action) {
      state.submitting = Boolean(action.payload)
    },
    setTaskDeleting(state, action) {
      state.deleting = Boolean(action.payload)
    },
    setTodoUpdating(state, action) {
      state.todoUpdating = Boolean(action.payload)
    },
    setCommentsLoading(state, action) {
      state.commentsLoading = Boolean(action.payload)
    },
    setCommentSubmitting(state, action) {
      state.commentSubmitting = Boolean(action.payload)
    },
  },
})

export const {
  deleteTask,
  removeProjectTasks,
  setCommentSubmitting,
  setCommentsLoading,
  setProjectTasks,
  setTaskComments,
  setTaskDeleting,
  setTaskDetailLoading,
  setTaskDetails,
  setTaskError,
  setTaskListLoading,
  setTasks,
  setTaskSubmitting,
  setTodoUpdating,
  toggleChecklist,
  updateTask,
} = taskSlice.actions

export const selectTaskState = (state) => state.task
export const selectTasks = (state) => state.task.items

export default taskSlice.reducer
