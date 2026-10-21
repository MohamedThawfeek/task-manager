import { useSelector } from 'react-redux'
import dayjs from 'dayjs'

const statuses = ['To Do', 'In Progress', 'Review', 'Done']

export default function useReports() {
  const tasks = useSelector((state) => state.task.items)
  const completed = tasks.filter((task) => task.status === 'Done').length
  const overdue = tasks.filter((task) => (
    dayjs(task.dueDate).isBefore(dayjs(), 'day') && task.status !== 'Done'
  )).length
  const completionRate = tasks.length ? Math.round((completed / tasks.length) * 100) : 0
  const statusData = statuses.map((name) => ({
    name,
    value: tasks.filter((task) => task.status === name).length,
  }))
  const month = dayjs().startOf('month')
  const checkpoints = [...new Set([1, 5, 10, 15, 20, 25, month.daysInMonth()])]
  const trend = checkpoints.map((day) => ({
    date: month.date(day).format('MMM D'),
    value: tasks.filter((task) => (
      task.status === 'Done' && dayjs(task.dueDate).isBefore(month.date(day).endOf('day'))
    )).length,
  }))

  return { tasks, completed, overdue, completionRate, statusData, trend }
}
