import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { closeSidebar, toggleSidebar, toggleTheme } from '../../redux/slice/ui'
import { logout } from '../../redux/slice/auth'
import { markAllRead } from '../../redux/slice/notifications'
import { clearStoredAuth } from '../../service/authStorage'

export default function useAppLayout() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { theme, sidebarOpen } = useSelector((state) => state.ui)
  const user = useSelector((state) => state.auth.user)
  const notifications = useSelector((state) => state.notifications.items)
  const tasks = useSelector((state) => state.workspace.tasks)
  const projects = useSelector((state) => state.workspace.projects)
  const [noticeOpen, setNoticeOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [resultsOpen, setResultsOpen] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

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

  const closeNavigation = () => dispatch(closeSidebar())
  const toggleNavigation = () => dispatch(toggleSidebar())
  const toggleColorMode = () => dispatch(toggleTheme())
  const readAllNotifications = () => dispatch(markAllRead())
  const chooseResult = (result) => {
    navigate(result.path)
    setQuery('')
    setResultsOpen(false)
  }
  const signOut = () => {
    clearStoredAuth()
    dispatch(logout())
    toast.success('Signed out')
    navigate('/login')
  }

  return {
    navigate,
    theme,
    sidebarOpen,
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
    closeNavigation,
    toggleNavigation,
    toggleColorMode,
    readAllNotifications,
    chooseResult,
    signOut,
  }
}
