import dayjs from 'dayjs'
import { Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const COLORS = ['#a940bf', '#2d86f5', '#f8b52b', '#77b341']

export default function AnalyticsPanels({ tasks }) {
  const currentMonth = dayjs().startOf('month')
  const finalDay = currentMonth.daysInMonth()
  const checkpoints = [...new Set([1, 5, 10, 15, 20, 25, finalDay].filter((day) => day <= finalDay))]
  const trend = checkpoints.map((day) => ({
    date: currentMonth.date(day).format('MMM D'),
    value: tasks.filter((task) => task.status === 'Done' && dayjs(task.dueDate).isBefore(currentMonth.date(day).endOf('day'))).length,
  }))
  const statusData = ['To Do', 'In Progress', 'Review', 'Done'].map((name) => ({
    name,
    value: tasks.filter((task) => task.status === name).length,
  }))

  return <section className="mt-6">
    <div className="mb-4"><h2 className="text-xl font-bold">Reports & Analytics</h2><p className="mt-1 text-sm text-muted">Your productivity and task status at a glance</p></div>
    <div className="grid gap-5 xl:grid-cols-[2.2fr_1fr]">
      <article className="card p-5 sm:p-6"><h3 className="text-xl font-bold">Task Completion Trend</h3><div className="mt-5 h-[300px]"><ResponsiveContainer width="100%" height="100%"><LineChart data={trend} margin={{ left: -20, right: 12 }}><XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#8290ad', fontSize: 12 }} /><YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#8290ad', fontSize: 12 }} /><Tooltip /><Line type="monotone" dataKey="value" name="Completed" stroke="#5548f7" strokeWidth={4} dot={{ fill: '#5548f7', r: 3 }} activeDot={{ r: 6 }} /></LineChart></ResponsiveContainer></div></article>
      <article className="card p-5 sm:p-6"><h3 className="text-xl font-bold">Tasks by Status</h3><div className="h-[300px]"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={statusData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={96} paddingAngle={1}>{statusData.map((item, index) => <Cell key={item.name} fill={COLORS[index]} />)}</Pie><Tooltip /><Legend iconType="circle" /></PieChart></ResponsiveContainer></div></article>
    </div>
  </section>
}
