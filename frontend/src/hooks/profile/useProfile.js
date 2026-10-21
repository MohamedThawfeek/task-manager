import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { selectLoader, setLoader } from '../../redux/slice/initialLoader'
import {
  getUserActivity,
  getUserProfileProjects,
  getUserProfileTasks,
} from '../../service/task'

export default function useProfile() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const workspaceProfile = useSelector((state) => state.workspace.profile)
  const authUser = useSelector((state) => state.auth.user)
  const taskLoading = useSelector(selectLoader('profileTasks'))
  const projectLoading = useSelector(selectLoader('profileProjects'))
  const activityLoading = useSelector(selectLoader('profileActivity'))
  const [tab, setTab] = useState('Overview')
  const [assignedTasks, setAssignedTasks] = useState([])
  const [assignedProjects, setAssignedProjects] = useState([])
  const [activities, setActivities] = useState([])
  const [error, setError] = useState('')
  const profile = useMemo(() => ({
    ...workspaceProfile,
    ...authUser,
    id: authUser?._id || authUser?.id || workspaceProfile.id,
    jobTitle: authUser?.role || authUser?.jobTitle || workspaceProfile.jobTitle,
    avatar: authUser?.profile || authUser?.avatar || workspaceProfile.avatar,
  }), [authUser, workspaceProfile])

  const loadTasks = useCallback(async () => {
    dispatch(setLoader({ key: 'profileTasks', value: true }))
    setError('')
    try {
      const rows = await getUserProfileTasks()
      setAssignedTasks(rows)
      return rows
    } catch (requestError) {
      setError(requestError.message || 'Unable to load profile tasks')
      throw requestError
    } finally {
      dispatch(setLoader({ key: 'profileTasks', value: false }))
    }
  }, [dispatch])

  const loadProjects = useCallback(async () => {
    dispatch(setLoader({ key: 'profileProjects', value: true }))
    setError('')
    try {
      const rows = await getUserProfileProjects()
      setAssignedProjects(rows)
      return rows
    } catch (requestError) {
      setError(requestError.message || 'Unable to load profile projects')
      throw requestError
    } finally {
      dispatch(setLoader({ key: 'profileProjects', value: false }))
    }
  }, [dispatch])

  const loadActivity = useCallback(async () => {
    dispatch(setLoader({ key: 'profileActivity', value: true }))
    setError('')
    try {
      const rows = await getUserActivity()
      setActivities(rows)
      return rows
    } catch (requestError) {
      setError(requestError.message || 'Unable to load recent activity')
      throw requestError
    } finally {
      dispatch(setLoader({ key: 'profileActivity', value: false }))
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
    error,
    taskLoading,
    projectLoading,
    activityLoading,
    loadTasks,
    loadProjects,
    loadActivity,
  }
}
