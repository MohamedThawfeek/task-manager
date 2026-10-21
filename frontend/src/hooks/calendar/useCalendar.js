import { useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'

export default function useCalendar() {
  const tasks = useSelector((state) => state.task.items)
  const navigate = useNavigate()
  const [view, setView] = useState('Month')
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
  const weekStart = dayjs().startOf('week')
  const weekDays = Array.from({ length: 7 }, (_, index) => weekStart.add(index, 'day'))
  const todayTasks = eventsForDate(dayjs())

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
    todayTasks,
  }
}
