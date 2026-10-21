import { Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { CheckSquare, Clock3, ListTodo, Square } from 'lucide-react'
import { PageHeader, StatCard } from '../components/common'
import useReports from '../hooks/report/useReports'

const COLORS = ['#a940bf','#2d86f5','#f8b52b','#77b341']
export default function ReportsPage() {
  const { tasks, completed, overdue, completionRate, statusData, trend } = useReports()
  return <><PageHeader title="Reports & Analytics" subtitle="Track your productivity and performance" /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Total Tasks" value={tasks.length} icon={<ListTodo />} /><StatCard label="Completed" value={completed} icon={<CheckSquare />} tone="green" /><StatCard label="Completion Rate" value={`${completionRate}%`} icon={<Clock3 />} tone="green" /><StatCard label="Overdue" value={overdue} icon={<Square />} tone="red" /></div><div className="mt-6 grid gap-5 xl:grid-cols-[2.2fr_1fr]"><section className="card p-6"><h2 className="text-xl font-bold">Task Completion Trend</h2><div className="mt-5 h-[300px]"><ResponsiveContainer width="100%" height="100%"><LineChart data={trend}><XAxis dataKey="date" axisLine={false} tickLine={false} /><YAxis hide /><Tooltip /><Line type="linear" dataKey="value" stroke="#5548f7" strokeWidth={4} dot={false} /></LineChart></ResponsiveContainer></div></section><section className="card p-6"><h2 className="text-xl font-bold">Tasks by Status</h2><div className="h-[300px]"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={statusData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={1}>{statusData.map((item, index) => <Cell key={item.name} fill={COLORS[index]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></div></section></div></>
}
