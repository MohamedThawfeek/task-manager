import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  addComment,
  deleteTask as removeTaskFromStore,
  setProjects,
  setTaskDetails,
  setTaskError,
  setTasks,
  toggleChecklist,
  updateTask as updateTaskInStore,
} from '../../redux/slice/workspace'
import { selectLoader, setLoader } from '../../redux/slice/initialLoader'
import { selectTeamRows, setTeamRows } from '../../redux/slice/team'
import { getProjects } from '../../service/project'
import {
  createTask,
  deleteTask,
  getTask,
  getTasks,
  updateTask,
  updateTaskStatus,
  updateTodoStatus,
} from '../../service/task'
import { getUsers } from '../../service/user'
import { getTaskAssignees } from '../../utils/tasks'

function resolveStatusId(projects, projectId, statusName, fallbackId = '') {
  const project = projects.find((item) => item.id === projectId)
  const status = project?.statuses?.find((item) => item.name === statusName)
  return status?.id || fallbackId
}

export function useTasksPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { tasks, projects, taskError } = useSelector((state) => state.workspace)
  const access = useSelector((state) => state.auth.user?.access || 'User')
  const team = useSelector(selectTeamRows)
  const isLoading = useSelector(selectLoader('taskList'))
  const [project, setProject] = useState('All')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('dueDate')

  const loadTasks = useCallback(async () => {
    dispatch(setLoader({ key: 'taskList', value: true }))
    dispatch(setTaskError(''))
    try {
      const rows = await getTasks(access)
      dispatch(setTasks(rows))
      return rows
    } catch (error) {
      dispatch(setTaskError(error.message || 'Unable to load tasks'))
      throw error
    } finally {
      dispatch(setLoader({ key: 'taskList', value: false }))
    }
  }, [access, dispatch])

  useEffect(() => {
    loadTasks().catch(() => undefined)
    getProjects(access)
      .then((rows) => dispatch(setProjects(rows)))
      .catch(() => undefined)
    getUsers()
      .then((rows) => dispatch(setTeamRows(rows)))
      .catch(() => undefined)
  }, [access, dispatch, loadTasks])

  const list = useMemo(() => tasks
    .filter((task) => (
      (project === 'All' || task.projectId === project)
      && task.title.toLowerCase().includes(query.toLowerCase())
    ))
    .sort((first, second) => (
      sort === 'title'
        ? first.title.localeCompare(second.title)
        : String(first[sort] || '').localeCompare(String(second[sort] || ''))
    )), [tasks, project, query, sort])

  const dropTask = async (status, event) => {
    event.preventDefault()
    const id = event.dataTransfer.getData('taskId')
    const boardTask = tasks.find((item) => item.id === id)
    if (!boardTask || boardTask.status === status) return

    try {
      const statusId = resolveStatusId(projects, boardTask.projectId, status)
      if (!statusId) throw new Error('The selected project status is unavailable')
      const movedTask = { ...boardTask, status, statusId }
      dispatch(updateTaskInStore(movedTask))
      const result = await updateTaskStatus(id, statusId)
      toast.success(result.message || `Task moved to ${status}`)
    } catch (error) {
      dispatch(updateTaskInStore(boardTask))
      toast.error(error.message || 'Unable to move the task')
    }
  }

  const projectName = (id, task) => projects.find((item) => item.id === id)?.name
    || task?.projectName
    || ''
  const taskAssignees = (task) => {
    const members = getTaskAssignees(task, team)
    return members.length ? members : task.assignees || []
  }

  return {
    projects,
    list,
    project,
    setProject,
    query,
    setQuery,
    sort,
    setSort,
    navigate,
    dropTask,
    projectName,
    taskAssignees,
    loadTasks,
    isLoading,
    error: taskError,
  }
}

export function useTaskFormPage() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { tasks, projects, taskError } = useSelector((state) => state.workspace)
  const access = useSelector((state) => state.auth.user?.access || 'User')
  const team = useSelector(selectTeamRows)
  const isLoading = useSelector(selectLoader('taskDetail'))
  const isSubmitting = useSelector(selectLoader('taskSubmit'))
  const fetchedTaskId = useRef('')
  const initialTask = id ? tasks.find((task) => task.id === id) : null
  const initial = initialTask || {
    projectId: params.get('project') || '',
    status: params.get('status') || 'To Do',
  }

  useEffect(() => {
    getProjects(access)
      .then((rows) => dispatch(setProjects(rows)))
      .catch((error) => dispatch(setTaskError(error.message)))
    getUsers()
      .then((rows) => dispatch(setTeamRows(rows)))
      .catch(() => undefined)
  }, [access, dispatch])

  useEffect(() => {
    if (!id || fetchedTaskId.current === id) return
    fetchedTaskId.current = id
    dispatch(setLoader({ key: 'taskDetail', value: true }))
    dispatch(setTaskError(''))
    getTask(id, initialTask)
      .then((task) => dispatch(setTaskDetails(task)))
      .catch((error) => dispatch(setTaskError(error.message || 'Unable to load the task')))
      .finally(() => dispatch(setLoader({ key: 'taskDetail', value: false })))
  }, [dispatch, id, initialTask])

  const saveTask = async (data) => {
    const statusId = resolveStatusId(
      projects,
      data.projectId,
      data.status,
      data.status === initialTask?.status ? initialTask?.statusId : '',
    )
    if (!statusId) {
      toast.error('Select a project with an available task status')
      return
    }

    dispatch(setLoader({ key: 'taskSubmit', value: true }))
    dispatch(setTaskError(''))
    try {
      const payload = {
        ...data,
        ...(initialTask && { id: initialTask.id }),
        statusId,
      }
      const result = initialTask
        ? await updateTask(payload)
        : await createTask(payload)
      dispatch(setTaskDetails(result.task))
      toast.success(result.message || (initialTask ? 'Task updated' : 'Task created'))
      navigate(`/tasks/${result.task.id}`)
    } catch (error) {
      dispatch(setTaskError(error.message || 'Unable to save the task'))
      toast.error(error.message || 'Unable to save the task')
    } finally {
      dispatch(setLoader({ key: 'taskSubmit', value: false }))
    }
  }

  return {
    id,
    navigate,
    initialTask,
    initial,
    projects,
    team,
    saveTask,
    isLoading,
    isSubmitting,
    error: taskError,
  }
}

export function useTaskDetailsPage() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { tasks, projects, taskError } = useSelector((state) => state.workspace)
  const team = useSelector(selectTeamRows)
  const isLoading = useSelector(selectLoader('taskDetail'))
  const isDeleting = useSelector(selectLoader('taskDelete'))
  const isUpdatingTodo = useSelector(selectLoader('todoUpdate'))
  const [comment, setComment] = useState('')
  const [confirm, setConfirm] = useState(false)
  const fetchedTaskId = useRef('')
  const task = tasks.find((item) => item.id === id)
  const project = projects.find((item) => item.id === task?.projectId)
  const storeAssignees = task ? getTaskAssignees(task, team) : []
  const assignees = storeAssignees.length ? storeAssignees : task?.assignees || []
  const complete = task?.checklist.filter((item) => item.completed).length || 0
  const percent = task?.checklist.length
    ? Math.round((complete / task.checklist.length) * 100)
    : 0

  const loadTask = useCallback(async (fallback) => {
    dispatch(setLoader({ key: 'taskDetail', value: true }))
    dispatch(setTaskError(''))
    try {
      const details = await getTask(id, fallback)
      dispatch(setTaskDetails(details))
      return details
    } catch (error) {
      dispatch(setTaskError(error.message || 'Unable to load the task'))
      throw error
    } finally {
      dispatch(setLoader({ key: 'taskDetail', value: false }))
    }
  }, [dispatch, id])

  useEffect(() => {
    if (!id || fetchedTaskId.current === id) return
    fetchedTaskId.current = id
    loadTask(task).catch(() => undefined)
  }, [id, loadTask, task])

  const sendComment = () => {
    if (!comment.trim()) return
    dispatch(addComment({
      taskId: id,
      comment: {
        id: `cm-${Date.now()}`,
        author: 'You',
        text: comment.trim(),
        createdAt: new Date().toISOString(),
      },
    }))
    setComment('')
    toast.success('Comment added for this session')
  }

  const toggleChecklistItem = async (itemId) => {
    const item = task?.checklist.find((entry) => entry.id === itemId)
    if (!item || isUpdatingTodo) return
    dispatch(toggleChecklist({ taskId: id, itemId }))
    dispatch(setLoader({ key: 'todoUpdate', value: true }))
    try {
      const result = await updateTodoStatus(id, itemId, !item.completed)
      await loadTask({
        ...task,
        checklist: task.checklist.map((entry) => (
          entry.id === itemId ? { ...entry, completed: !entry.completed } : entry
        )),
      })
      toast.success(result.message || 'Checklist updated')
    } catch (error) {
      dispatch(toggleChecklist({ taskId: id, itemId }))
      toast.error(error.message || 'Unable to update the checklist')
    } finally {
      dispatch(setLoader({ key: 'todoUpdate', value: false }))
    }
  }

  const removeTask = async () => {
    dispatch(setLoader({ key: 'taskDelete', value: true }))
    try {
      const result = await deleteTask(id)
      dispatch(removeTaskFromStore(id))
      toast.success(result.message || 'Task deleted')
      navigate('/tasks')
    } catch (error) {
      toast.error(error.message || 'Unable to delete the task')
    } finally {
      dispatch(setLoader({ key: 'taskDelete', value: false }))
    }
  }

  return {
    id,
    navigate,
    task,
    project,
    assignees,
    complete,
    percent,
    comment,
    setComment,
    confirm,
    setConfirm,
    sendComment,
    toggleChecklistItem,
    removeTask,
    isLoading,
    isDeleting,
    isUpdatingTodo,
    error: taskError,
  }
}
