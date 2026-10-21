import { useCallback, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import api from '../../service/axios'
import { apiPath } from '../../service/path'
import {
  selectDashboardState,
  setDashboardData,
  setDashboardError,
  setDashboardLoading,
} from '../../redux/slice/dashboard'
import { formatProject, normalizeTask } from '../../utils/apiData'

export default function useDashboard() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector((state) => state.auth.user)
  const dashboard = useSelector(selectDashboardState)

  const loadDashboard = useCallback(async () => {
    dispatch(setDashboardLoading(true))
    dispatch(setDashboardError(''))

    try {
      const [
        taskCountResponse,
        projectsResponse,
        recentTasksResponse,
        upcomingTasksResponse,
        barChartResponse,
        doughnutChartResponse,
      ] = await Promise.all([
        api.get(
          apiPath.adminDashboardTaskCount,
          'Unable to load dashboard task counts',
        ),
        api.get(
          apiPath.adminDashboardProjects,
          'Unable to load dashboard projects',
        ),
        api.get(
          apiPath.adminDashboardRecentTasks,
          'Unable to load recent tasks',
        ),
        api.get(
          apiPath.adminDashboardUpcomingTasks,
          'Unable to load upcoming tasks',
        ),
        api.get(
          apiPath.adminDashboardBarChart,
          'Unable to load the task completion chart',
        ),
        api.get(
          apiPath.adminDashboardDoughnutChart,
          'Unable to load the task status chart',
        ),
      ])

      const taskCount = taskCountResponse.data || {}
      const projects = (Array.isArray(projectsResponse.data)
        ? projectsResponse.data
        : []).map((project, index) => formatProject({
        ...project,
        _id: project.project_id,
        task_count: project.total_tasks,
        project_access: project.members,
      }, index))
      const recentTasks = (Array.isArray(recentTasksResponse.data)
        ? recentTasksResponse.data
        : []).map((task) => normalizeTask({
        ...task,
        task_id: task.id,
      }))
      const upcomingTasks = (Array.isArray(upcomingTasksResponse.data)
        ? upcomingTasksResponse.data
        : []).map((task) => normalizeTask(task))
      const completionTrend = (Array.isArray(barChartResponse.data)
        ? barChartResponse.data
        : []).map((item) => ({
        ...item,
        value: Number(item.completed) || 0,
      }))
      const statusChart = (Array.isArray(doughnutChartResponse.data)
        ? doughnutChartResponse.data
        : []).map((item) => ({
        ...item,
        value: Number(item.value) || 0,
      }))

      dispatch(setDashboardData({
        counts: {
          total: Number(taskCount.totalTask?.count) || 0,
          completed: Number(taskCount.completedTask?.count) || 0,
          inProgress: Number(taskCount.inProgressTask?.count) || 0,
          overdue: Number(taskCount.overdueTask?.count) || 0,
        },
        projects,
        recentTasks,
        upcomingTasks,
        completionTrend,
        statusChart,
      }))
    } catch (requestError) {
      dispatch(setDashboardError(
        requestError.message || 'Unable to load dashboard',
      ))
    } finally {
      dispatch(setDashboardLoading(false))
    }
  }, [dispatch])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  const calendarTasks = useMemo(() => {
    const rows = [...dashboard.recentTasks, ...dashboard.upcomingTasks]
    return [...new Map(rows.map((task) => [task.id, task])).values()]
  }, [dashboard.recentTasks, dashboard.upcomingTasks])
  const month = dayjs().startOf('month')
  const mondayFirstOffset = (month.day() + 6) % 7
  const calendarCells = [
    ...Array.from({ length: mondayFirstOffset }, () => null),
    ...Array.from({ length: month.daysInMonth() }, (_, index) => index + 1),
  ]
  const today = dayjs()
  const hasTask = (day) => calendarTasks.some((task) => {
    const due = dayjs(task.dueDate)
    return due.year() === month.year()
      && due.month() === month.month()
      && due.date() === day
  })

  return {
    navigate,
    user,
    ...dashboard,
    month,
    today,
    calendarCells,
    hasTask,
    loadDashboard,
  }
}
