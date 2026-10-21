import ApiRequest, { getApiErrorMessage } from './axios'
import { apiPath } from './path'
import { getProjects } from './project'

function ensureSuccess(response, fallback) {
  if (!response?.status) throw new Error(response?.message || fallback)
  return response
}

function serviceError(error, fallback) {
  if (!error.response && error.message && error.code !== 'ERR_NETWORK') return error
  return new Error(getApiErrorMessage(error, fallback))
}

function identifier(value) {
  return String(value?._id || value?.id || value?.task_id || value?.user_id || value || '')
}

function normalizeStatusName(value = '') {
  const status = String(value).trim().toLowerCase()
  if (status === 'to do') return 'To Do'
  if (status === 'in progress') return 'In Progress'
  if (status === 'review') return 'Review'
  if (status === 'done') return 'Done'
  return value || 'To Do'
}

function normalizeAttachment(attachment, index) {
  if (typeof attachment === 'string') {
    return {
      id: `attachment-${index}`,
      name: `Attachment ${index + 1}`,
      url: attachment,
    }
  }
  return {
    ...attachment,
    id: identifier(attachment) || `attachment-${index}`,
    name: attachment?.name || `Attachment ${index + 1}`,
    url: attachment?.url || attachment?.data || '',
  }
}

function normalizeTodo(todo, index) {
  return {
    ...todo,
    id: identifier(todo) || `todo-${index}`,
    title: todo?.title || '',
    completed: Boolean(todo?.completed),
  }
}

function normalizeComment(comment, index) {
  return {
    id: identifier(comment) || `comment-${index}`,
    author: comment?.created_by?.name || comment?.created_by || comment?.author || 'Team member',
    text: comment?.command || comment?.text || '',
    createdAt: comment?.created_at || comment?.createdAt || '',
  }
}

export function normalizeTask(task, fallback = {}) {
  const project = task?.project || task?.project_id
  const statusObject = typeof task?.status === 'object'
    ? task.status
    : typeof task?.status_id === 'object'
      ? task.status_id
      : null
  const statusName = statusObject?.status_type
    || (typeof task?.status === 'string' ? task.status : '')
    || fallback.status
  const statusId = identifier(statusObject?.status_id || statusObject || task?.status_id)
    || fallback.statusId
    || ''
  const assigned = Array.isArray(task?.assigned_to) ? task.assigned_to : []
  const todos = Array.isArray(task?.todos) ? task.todos : task?.checklist || []
  const attachments = Array.isArray(task?.attachments) ? task.attachments : []
  const comments = Array.isArray(task?.comments) ? task.comments : []

  return {
    ...fallback,
    ...task,
    id: identifier(task?.task_id || task) || fallback.id,
    title: task?.title || fallback.title || 'Untitled task',
    description: task?.description || '',
    projectId: (typeof project === 'object' ? identifier(project?.project_id || project) : '')
      || fallback.projectId
      || '',
    projectName: project?.name
      || (typeof task?.project === 'string' ? task.project : '')
      || fallback.projectName
      || '',
    statusId,
    status: normalizeStatusName(statusName),
    priority: task?.priority || fallback.priority || 'Medium',
    dueDate: task?.due_date || task?.dueDate || fallback.dueDate || '',
    assigneeIds: assigned.map(identifier).filter(Boolean),
    assignees: assigned.some((user) => typeof user === 'object')
      ? assigned.filter((user) => typeof user === 'object').map((user) => ({
        ...user,
        id: identifier(user),
        name: user?.name || 'Team member',
      }))
      : fallback.assignees || [],
    checklist: todos.map(normalizeTodo),
    attachments: attachments.map(normalizeAttachment),
    comments: comments.map(normalizeComment),
  }
}

function appendTaskFormData(formData, task, includeId) {
  if (includeId) formData.append('task_id', task.id)
  formData.append('title', task.title.trim())
  formData.append('project_id', task.projectId)
  formData.append('status_id', task.statusId)
  formData.append('description', task.description?.trim() || '')
  formData.append('priority', task.priority)
  formData.append('due_date', task.dueDate)
  formData.append('assigned_to', JSON.stringify(task.assigneeIds || []))
  formData.append('todos', JSON.stringify((task.checklist || []).map((todo) => ({
    title: todo.title,
    completed: Boolean(todo.completed),
  }))))

  const retainedAttachments = (task.attachments || [])
    .filter((attachment) => !attachment.file && attachment.url)
    .map((attachment) => attachment.url)
  formData.append('attachments', JSON.stringify(retainedAttachments))
  const attachments = task.attachments || []
  attachments.forEach((attachment) => {
    if (attachment.file) formData.append('attachments', attachment.file)
  })
}

export async function getTasks(access) {
  try {
    const endpoint = String(access).toLowerCase() === 'admin'
      ? apiPath.adminTasks
      : apiPath.userTasks
    const response = ensureSuccess(await ApiRequest.get(endpoint), 'Unable to load tasks')
    return (Array.isArray(response.data) ? response.data : []).flatMap((column) =>
      (column.tasks || []).map((task) => normalizeTask({
        ...task,
        status: task.status || column.status,
      })))
  } catch (error) {
    throw serviceError(error, 'Unable to load tasks')
  }
}

export async function getTask(taskId, fallback) {
  try {
    const response = ensureSuccess(
      await ApiRequest.post(apiPath.task, { task_id: taskId }),
      'Unable to load the task',
    )
    return normalizeTask({
      ...response.data?.task,
      task_id: taskId,
      comments: response.data?.comments || [],
    }, fallback)
  } catch (error) {
    throw serviceError(error, 'Unable to load the task')
  }
}

export async function createTask(task) {
  try {
    const formData = new FormData()
    appendTaskFormData(formData, task, false)
    const response = ensureSuccess(
      await ApiRequest.post(apiPath.createTask, formData),
      'Unable to create the task',
    )
    return {
      ...response,
      task: normalizeTask(response.task || {}, task),
    }
  } catch (error) {
    throw serviceError(error, 'Unable to create the task')
  }
}

export async function updateTask(task) {
  try {
    const formData = new FormData()
    appendTaskFormData(formData, task, true)
    const response = ensureSuccess(
      await ApiRequest.put(apiPath.updateTask, formData),
      'Unable to update the task',
    )
    return {
      ...response,
      task: normalizeTask(response.task || {}, task),
    }
  } catch (error) {
    throw serviceError(error, 'Unable to update the task')
  }
}

export async function updateTaskStatus(taskId, statusId) {
  try {
    return ensureSuccess(
      await ApiRequest.put(apiPath.updateTaskStatus, {
        task_id: taskId,
        status_id: statusId,
      }),
      'Unable to update the task status',
    )
  } catch (error) {
    throw serviceError(error, 'Unable to update the task status')
  }
}

export async function updateTodoStatus(taskId, todoId, completed) {
  try {
    return ensureSuccess(
      await ApiRequest.put(apiPath.updateTodoStatus, {
        task_id: taskId,
        todo_id: todoId,
        completed,
      }),
      'Unable to update the checklist item',
    )
  } catch (error) {
    throw serviceError(error, 'Unable to update the checklist item')
  }
}

export async function deleteTask(taskId) {
  try {
    return ensureSuccess(
      await ApiRequest.delete(apiPath.deleteTask, { task_id: taskId }),
      'Unable to delete the task',
    )
  } catch (error) {
    throw serviceError(error, 'Unable to delete the task')
  }
}

export async function getUserProfileTasks() {
  try {
    const response = ensureSuccess(
      await ApiRequest.get(apiPath.userProfileTasks),
      'Unable to load profile tasks',
    )
    return (response.data || []).map(normalizeTask)
  } catch (error) {
    throw serviceError(error, 'Unable to load profile tasks')
  }
}

export async function getUserActivity() {
  try {
    const response = ensureSuccess(
      await ApiRequest.get(apiPath.userActivity),
      'Unable to load recent activity',
    )
    return (response.data || []).map((activity) => ({
      ...activity,
      id: `${identifier(activity.task_id)}-${identifier(activity.todo_id)}`,
      taskId: identifier(activity.task_id),
      todoId: identifier(activity.todo_id),
      updatedAt: activity.updated_at,
    }))
  } catch (error) {
    throw serviceError(error, 'Unable to load recent activity')
  }
}

export async function getUserProfileProjects() {
  return getProjects('User')
}
