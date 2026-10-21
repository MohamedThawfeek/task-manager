import { useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import api from '../../service/axios'
import { apiPath } from '../../service/path'
import {
  selectReportState,
  setReportData,
  setReportError,
  setReportLoading,
} from '../../redux/slice/report'

export default function useReports() {
  const dispatch = useDispatch()
  const report = useSelector(selectReportState)

  const loadReports = useCallback(async () => {
    dispatch(setReportLoading(true))
    dispatch(setReportError(''))

    try {
      const [taskCountResponse, barChartResponse, doughnutChartResponse] =
        await Promise.all([
          api.get(
            apiPath.userDashboardTaskCount,
            'Unable to load report task counts',
          ),
          api.get(
            apiPath.userDashboardBarChart,
            'Unable to load the task completion chart',
          ),
          api.get(
            apiPath.userDashboardDoughnutChart,
            'Unable to load the task status chart',
          ),
        ])

      const taskCount = taskCountResponse.data || {}
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

      dispatch(setReportData({
        counts: {
          total: Number(taskCount.totalTask?.count) || 0,
          completed: Number(taskCount.completedTask?.count) || 0,
          completionRate: Number(taskCount.completedTask?.percentage) || 0,
          overdue: Number(taskCount.overdueTask?.count) || 0,
        },
        completionTrend,
        statusChart,
      }))
    } catch (requestError) {
      dispatch(setReportError(
        requestError.message || 'Unable to load reports',
      ))
    } finally {
      dispatch(setReportLoading(false))
    }
  }, [dispatch])

  useEffect(() => {
    loadReports()
  }, [loadReports])

  return { ...report, loadReports }
}
