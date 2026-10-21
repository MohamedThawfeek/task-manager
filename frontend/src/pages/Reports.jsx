import { Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { CheckSquare, Clock3, ListTodo, Square } from 'lucide-react'
import { EmptyState, LoadingScreen, PageHeader, StatCard } from '../components/common'
import useReports from '../hooks/report/useReports'

const COLORS = ['#a940bf','#2d86f5','#f8b52b','#77b341']
export default function ReportsPage() {
  const {
    counts,
    completionTrend,
    statusChart,
    loading,
    error,
    loadReports,
  } = useReports()

  const header = <PageHeader title="Reports & Analytics" subtitle="Track your productivity and performance" />

  if (loading) return <>{header}<LoadingScreen /></>
  if (error) return <>{header}<section className="card"><EmptyState title="Unable to load reports" message={error} action={<button className="primary-btn" onClick={loadReports}>Try Again</button>} /></section></>

  return <>{header}<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Total Tasks" value={counts.total} icon={<ListTodo />} /><StatCard label="Completed" value={counts.completed} icon={<CheckSquare />} tone="green" /><StatCard label="Completion Rate" value={`${counts.completionRate}%`} icon={<Clock3 />} tone="green" /><StatCard label="Overdue" value={counts.overdue} icon={<Square />} tone="red" /></div><div className="mt-6 grid gap-5 xl:grid-cols-[2.2fr_1fr]"><section className="card p-6"><h2 className="text-xl font-bold">Task Completion Trend</h2><div className="mt-5 h-[300px]"><ResponsiveContainer width="100%" height="100%"><LineChart data={completionTrend}><XAxis dataKey="date" axisLine={false} tickLine={false} /><YAxis hide /><Tooltip /><Line type="linear" dataKey="value" name="Completed" stroke="#5548f7" strokeWidth={4} dot={false} /></LineChart></ResponsiveContainer></div></section><section className="card p-6"><h2 className="text-xl font-bold">Tasks by Status</h2><div className="h-[300px]"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={statusChart} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={1}>{statusChart.map((item, index) => <Cell key={item.name} fill={item.color || COLORS[index]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></div></section></div></>
}
