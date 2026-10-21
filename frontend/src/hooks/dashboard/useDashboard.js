import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { selectTeamRows } from '../../redux/slice/team'

export default function useDashboard() {
  const navigate = useNavigate()
  const tasks = useSelector((state) => state.task.items)
  const projects = useSelector((state) => state.project.items)
  const user = useSelector((state) => state.auth.user)
  const team = useSelector(selectTeamRows)
  const completed = tasks.filter((task) => task.status === 'Done').length
  const inProgress = tasks.filter((task) => task.status === 'In Progress').length
  const overdue = tasks.filter((task) => (
    dayjs(task.dueDate).isBefore(dayjs(), 'day') && task.status !== 'Done'
  )).length
  const month = dayjs().startOf('month')
  const mondayFirstOffset = (month.day() + 6) % 7
  const calendarCells = [
    ...Array.from({ length: mondayFirstOffset }, () => null),
    ...Array.from({ length: month.daysInMonth() }, (_, index) => index + 1),
  ]
  const today = dayjs()

  const member = (id) => team.find((item) => item.id === id)
  const projectTasks = (id) => tasks.filter((task) => task.projectId === id)
  const hasTask = (day) => tasks.some((task) => {
    const due = dayjs(task.dueDate)
    return due.year() === month.year() && due.month() === month.month() && due.date() === day
  })

  return {
    navigate,
    user,
    tasks,
    projects,
    team,
    completed,
    inProgress,
    overdue,
    member,
    projectTasks,
    month,
    today,
    calendarCells,
    hasTask,
  }
}
