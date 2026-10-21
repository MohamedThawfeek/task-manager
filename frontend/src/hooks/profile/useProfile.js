import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import {
  selectProfileState,
  setProfileActivities,
  setProfileActivityLoading,
  setProfileError,
  setProfileProjects,
  setProfileProjectsLoading,
  setProfileTasks,
  setProfileTasksLoading,
} from '../../redux/slice/profile'
import api from '../../service/axios'
import { apiPath } from '../../service/path'
import { formatProject, getId, normalizeTask } from '../../utils/apiData'

export default function useProfile() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const profileState = useSelector(selectProfileState)
  const authUser = useSelector((state) => state.auth.user)
  const [tab, setTab] = useState('Overview')
  const profileDetails = profileState.details
  const assignedTasks = profileState.tasks
  const assignedProjects = profileState.projects
  const activities = profileState.activities
  const profile = useMemo(() => ({
    ...profileDetails,
    ...authUser,
    id: authUser?._id || authUser?.id || profileDetails.id,
    jobTitle: authUser?.role || authUser?.jobTitle || profileDetails.jobTitle,
    avatar: authUser?.profile || authUser?.avatar || profileDetails.avatar,
  }), [authUser, profileDetails])

  const loadTasks = useCallback(async () => {
    dispatch(setProfileTasksLoading(true))
    dispatch(setProfileError(''))
    try {
      const response = await api.get(
        apiPath.userProfileTasks,
        'Unable to load profile tasks',
      )
      const rows = (Array.isArray(response.data) ? response.data : [])
        .map((task) => normalizeTask(task))
      dispatch(setProfileTasks(rows))
      return rows
    } catch (requestError) {
      dispatch(setProfileError(requestError.message || 'Unable to load profile tasks'))
      throw requestError
    } finally {
      dispatch(setProfileTasksLoading(false))
    }
  }, [dispatch])

  const loadProjects = useCallback(async () => {
    dispatch(setProfileProjectsLoading(true))
    dispatch(setProfileError(''))
    try {
      const response = await api.get(
        apiPath.userProjects,
        'Unable to load profile projects',
      )
      const rows = (Array.isArray(response.projects) ? response.projects : [])
        .map(formatProject)
      dispatch(setProfileProjects(rows))
      return rows
    } catch (requestError) {
      dispatch(setProfileError(requestError.message || 'Unable to load profile projects'))
      throw requestError
    } finally {
      dispatch(setProfileProjectsLoading(false))
    }
  }, [dispatch])

  const loadActivity = useCallback(async () => {
    dispatch(setProfileActivityLoading(true))
    dispatch(setProfileError(''))
    try {
      const response = await api.get(
        apiPath.userActivity,
        'Unable to load recent activity',
      )
      const rows = (Array.isArray(response.data) ? response.data : [])
        .map((activity) => ({
          ...activity,
          id: `${getId(activity.task_id)}-${getId(activity.todo_id)}`,
          taskId: getId(activity.task_id),
          todoId: getId(activity.todo_id),
          updatedAt: activity.updated_at,
        }))
      dispatch(setProfileActivities(rows))
      return rows
    } catch (requestError) {
      dispatch(setProfileError(requestError.message || 'Unable to load recent activity'))
      throw requestError
    } finally {
      dispatch(setProfileActivityLoading(false))
    }
  }, [dispatch])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (tab === 'Overview') {
        Promise.allSettled([loadTasks(), loadProjects()])
        return
      }
      if (tab === 'Tasks') loadTasks().catch(() => undefined)
      if (tab === 'Projects') loadProjects().catch(() => undefined)
      if (tab === 'Activity') loadActivity().catch(() => undefined)
    }, 0)
    return () => window.clearTimeout(timer)
  }, [loadActivity, loadProjects, loadTasks, tab])

  const completed = assignedTasks.filter((task) => task.status === 'Done').length
  const inProgress = assignedTasks.filter((task) => task.status === 'In Progress').length
  const overdue = assignedTasks.filter((task) => (
    dayjs(task.dueDate).isBefore(dayjs(), 'day') && task.status !== 'Done'
  )).length

  return {
    navigate,
    profile,
    tab,
    setTab,
    assignedTasks,
    assignedProjects,
    activities,
    completed,
    inProgress,
    overdue,
    error: profileState.error,
    taskLoading: profileState.tasksLoading,
    projectLoading: profileState.projectsLoading,
    activityLoading: profileState.activityLoading,
    loadTasks,
    loadProjects,
    loadActivity,
  }
}
