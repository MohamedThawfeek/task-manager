import ApiRequest, { getApiErrorMessage } from './axios'
import { apiPath } from './path'

const colors = ['#5b4bff', '#2d86f5', '#19b97a', '#ff496c', '#f6a91b', '#8061ff']
const defaultBoardStatuses = ['To Do', 'In Progress', 'Review', 'Done']

function ensureSuccess(response, fallback) {
  if (!response?.status) throw new Error(response?.message || fallback)
  return response
}

function serviceError(error, fallback) {
  if (!error.response && error.message && error.code !== 'ERR_NETWORK') return error
  return new Error(getApiErrorMessage(error, fallback))
}

function identifier(value) {
  return String(value?._id || value?.id || value || '')
}

function titleCase(value = '') {
  return String(value)
    .toLowerCase()
    .replace(/(^|\s)\S/g, (letter) => letter.toUpperCase())
}

function normalizeStatusName(value = '') {
  const status = String(value).trim().toLowerCase()
  if (status === 'to do') return 'To Do'
  return titleCase(value)
}

function projectColor(project, index = 0) {
  const id = identifier(project)
  const hash = [...id].reduce((total, character) => total + character.charCodeAt(0), 0)
  return colors[(hash || index) % colors.length]
}

function normalizeMember(member) {
  const name = member?.name || 'Team member'
  return {
    ...member,
    id: identifier(member),
    name,
    role: member?.role || 'Team Member',
    avatar: member?.profile || name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase(),
  }
}

export function normalizeProject(project, index = 0) {
  const members = Array.isArray(project?.project_access)
    ? project.project_access.map(normalizeMember)
    : Array.isArray(project?.members)
      ? project.members.map(normalizeMember)
      : []
  const boardStatuses = Array.isArray(project?.board_status)
    ? project.board_status
    : Array.isArray(project?.statuses)
      ? project.statuses
      : []

  return {
    ...project,
    id: identifier(project),
    name: project?.name || 'Untitled project',
    description: project?.description || '',
    status: titleCase(project?.status || 'active'),
    progress: Number(project?.progress) || 0,
    dueDate: project?.due_date || project?.dueDate || '',
    createdAt: project?.created_at || project?.createdAt || '',
    memberIds: members.length
      ? members.map((member) => member.id)
      : (project?.memberIds || []).map(identifier),
    members,
    statuses: boardStatuses.map((status, statusIndex) => ({
      id: identifier(status),
      name: normalizeStatusName(status?.status_type || status?.name || defaultBoardStatuses[statusIndex]),
      color: status?.color || null,
    })).filter((status) => status.id),
    taskCount: Number(project?.task_count ?? project?.taskCount ?? 0),
    color: project?.color || projectColor(project, index),
  }
}

function projectPayload(project, includeId = false) {
  return {
    ...(includeId && { project_id: project.id }),
    name: project.name.trim(),
    description: project.description?.trim() || '',
    status: String(project.status || 'Active').toLowerCase(),
    progress: Number(project.progress) || 0,
    due_date: project.dueDate,
    users: project.memberIds,
  }
}

function normalizeTask(task, projectId) {
  const assigned = Array.isArray(task?.assigned_to) ? task.assigned_to : []
  return {
    ...task,
    id: identifier(task?.task_id || task),
    projectId,
    title: task?.title || 'Untitled task',
    assigneeIds: assigned.map(identifier).filter(Boolean),
    status: task?.status === 'To DO' ? 'To Do' : task?.status || 'To Do',
    priority: titleCase(task?.priority || 'medium'),
    dueDate: task?.due_date || '',
    checklist: task?.todos || [],
    attachments: task?.attachments || [],
    comments: task?.comments || [],
  }
}

export async function getProjects(access) {
  try {
    const endpoint = String(access).toLowerCase() === 'admin'
      ? apiPath.projects
      : apiPath.userProjects
    const response = ensureSuccess(await ApiRequest.get(endpoint), 'Unable to load projects')
    return Array.isArray(response.projects)
      ? response.projects.map(normalizeProject)
      : []
  } catch (error) {
    throw serviceError(error, 'Unable to load projects')
  }
}

export async function createProject(project) {
  try {
    return ensureSuccess(
      await ApiRequest.post(apiPath.createProject, projectPayload(project)),
      'Unable to create project',
    )
  } catch (error) {
    throw serviceError(error, 'Unable to create project')
  }
}

export async function updateProject(project) {
  try {
    return ensureSuccess(
      await ApiRequest.put(apiPath.updateProject, projectPayload(project, true)),
      'Unable to update project',
    )
  } catch (error) {
    throw serviceError(error, 'Unable to update project')
  }
}

export async function deleteProject(projectId) {
  try {
    return ensureSuccess(
      await ApiRequest.delete(apiPath.deleteProject, { project_id: projectId }),
      'Unable to delete project',
    )
  } catch (error) {
    throw serviceError(error, 'Unable to delete project')
  }
}

export async function getProject(projectId) {
  try {
    const response = ensureSuccess(
      await ApiRequest.post(apiPath.project, { project_id: projectId }),
      'Unable to load project',
    )
    const data = response.data || {}
    const members = Array.isArray(data.teams) ? data.teams.map(normalizeMember) : []
    const project = normalizeProject({
      ...(data.overview || {}),
      _id: data.overview?.id || projectId,
      project_access: members,
    })
    return {
      project,
      tasks: Array.isArray(data.tasks)
        ? data.tasks.map((task) => normalizeTask(task, projectId))
        : [],
      members,
    }
  } catch (error) {
    throw serviceError(error, 'Unable to load project')
  }
}
