import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { toggleTheme } from '../../redux/slice/ui'
import { logout } from '../../redux/slice/auth'
import { syncUser } from '../../redux/slice/auth'
import { markAllRead, setNotifications } from '../../redux/slice/notifications'
import { setProjects } from '../../redux/slice/project'
import { updateProfile } from '../../redux/slice/profile'
import { setTasks } from '../../redux/slice/task'
import { setTeamRows } from '../../redux/slice/team'
import { clearStoredAuth } from '../../service/authStorage'
import api from '../../service/axios'
import { apiPath } from '../../service/path'
import {
  formatNotification,
  formatProject,
  formatUser,
  normalizeTask,
} from '../../utils/apiData'
import { closeSidebar as closeSidebarAction, openSidebar as openSidebarAction } from '../../redux/slice/sidebar'

export default function useAppLayout() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const theme = useSelector((state) => state.ui.theme)
  const user = useSelector((state) => state.auth.user)
  const access = user?.access || 'User'
  const notifications = useSelector((state) => state.notifications.items)
  const tasks = useSelector((state) => state.task.items)
  const projects = useSelector((state) => state.project.items)
  const [noticeOpen, setNoticeOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [resultsOpen, setResultsOpen] = useState(false)
  const isSidebarOpen = useSelector((state) => state.sidebar.mobileOpen)
  const [logoutPopup, setLogoutPopup] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => {
    const loadProfile = async () => {
      const response = await api.get(apiPath.profile, 'Unable to load your profile')
      const profile = formatUser(response.user || {})
      dispatch(syncUser(profile))
      dispatch(updateProfile(profile))
    }

    const loadTasks = async () => {
      const url = String(access).toLowerCase() === 'admin'
        ? apiPath.adminTasks
        : apiPath.userTasks
      const response = await api.get(url, 'Unable to load tasks')
      const groups = Array.isArray(response.data) ? response.data : []
      const rows = groups.flatMap((group) => (group.tasks || []).map((task) => (
        normalizeTask({ ...task, status: task.status || group.status })
      )))
      dispatch(setTasks(rows))
    }

    const loadProjects = async () => {
      const url = String(access).toLowerCase() === 'admin'
        ? apiPath.projects
        : apiPath.userProjects
      const response = await api.get(url, 'Unable to load projects')
      const rows = (Array.isArray(response.projects) ? response.projects : [])
        .map(formatProject)
      dispatch(setProjects(rows))
    }

    const loadUsers = async () => {
      const response = await api.get(apiPath.users, 'Unable to load users')
      const rows = (Array.isArray(response.users) ? response.users : [])
        .map(formatUser)
      dispatch(setTeamRows(rows))
    }

    const loadNotifications = async () => {
      const response = await api.get(
        apiPath.notifications,
        'Unable to load notifications',
      )
      const rows = (Array.isArray(response.notifications)
        ? response.notifications
        : []).map(formatNotification)
      dispatch(setNotifications(rows))
    }

    loadProfile().catch(() => undefined)
    loadTasks().catch(() => undefined)
    loadProjects().catch(() => undefined)
    loadUsers().catch(() => undefined)
    loadNotifications().catch(() => undefined)
  }, [access, dispatch])

  const results = query.trim()
    ? [
      ...tasks.map((item) => ({ ...item, kind: 'Task', path: `/tasks/${item.id}` })),
      ...projects.map((item) => ({
        ...item,
        title: item.name,
        kind: 'Project',
        path: `/projects/${item.id}`,
      })),
    ].filter((item) => item.title.toLowerCase().includes(query.toLowerCase())).slice(0, 7)
    : []
  const unread = notifications.filter((item) => !item.read).length

  const toggleColorMode = () => dispatch(toggleTheme())
  const openSidebar = () => dispatch(openSidebarAction())
  const closeSidebar = () => dispatch(closeSidebarAction())
  const readAllNotifications = async () => {
    const unreadItems = notifications.filter((item) => !item.read)
    if (!unreadItems.length) return
    try {
      await Promise.all(unreadItems.map((item) => api.patch(
        apiPath.updateNotification,
        { notification_id: item.id },
        'Unable to update notification',
      )))
      dispatch(markAllRead())
    } catch (error) {
      toast.error(error.message || 'Unable to update notifications')
    }
  }
  const chooseResult = (result) => {
    navigate(result.path)
    setQuery('')
    setResultsOpen(false)
  }
  const handleLogout = () => {
    clearStoredAuth()
    dispatch(logout())
    setLogoutPopup(false)
    toast.success('Signed out')
    navigate('/login')
  }

  return {
    navigate,
    theme,
    isSidebarOpen,
    openSidebar,
    closeSidebar,
    logoutPopup,
    setLogoutPopup,
    user,
    notifications,
    noticeOpen,
    setNoticeOpen,
    profileOpen,
    setProfileOpen,
    query,
    setQuery,
    resultsOpen,
    setResultsOpen,
    results,
    unread,
    toggleColorMode,
    readAllNotifications,
    chooseResult,
    handleLogout,
  }
}
