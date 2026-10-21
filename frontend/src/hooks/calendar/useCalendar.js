import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import api from '../../service/axios'
import { apiPath } from '../../service/path'
import { normalizeTask } from '../../utils/apiData'

export default function useCalendar() {
  const navigate = useNavigate()
  const [view, setView] = useState('Month')
  const [tasks, setTasks] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const loadCalendarTasks = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await api.get(
        apiPath.userTasksCalendar,
        'Unable to load calendar tasks',
        { params: { type: view.toLowerCase() } },
      )
      const rows = Array.isArray(response.data) ? response.data : []
      setTasks(rows.map((task) => normalizeTask(task)))
    } catch (requestError) {
      setTasks([])
      setError(requestError.message || 'Unable to load calendar tasks')
    } finally {
      setIsLoading(false)
    }
  }, [view])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadCalendarTasks()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [loadCalendarTasks])

  const month = dayjs().startOf('month')
  const cells = [
    ...Array.from({ length: month.day() }, () => null),
    ...Array.from({ length: month.daysInMonth() }, (_, index) => index + 1),
  ]
  const renderEvents = (day) => tasks.filter((task) => {
    const due = dayjs(task.dueDate)
    return due.year() === month.year() && due.month() === month.month() && due.date() === day
  })
  const eventsForDate = (date) => tasks.filter((task) => (
    dayjs(task.dueDate).isSame(date, 'day')
  ))
  const weekStart = dayjs().startOf('day')
  const weekDays = Array.from({ length: 7 }, (_, index) => weekStart.add(index, 'day'))

  return {
    tasks,
    navigate,
    view,
    setView,
    month,
    cells,
    renderEvents,
    eventsForDate,
    weekDays,
    isLoading,
    error,
    loadCalendarTasks,
  }
}
