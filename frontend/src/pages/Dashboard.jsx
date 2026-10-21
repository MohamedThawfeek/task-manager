import dayjs from 'dayjs'
import { CheckSquare, Clock3, ListTodo, Plus, Square } from 'lucide-react'
import { Avatar, EmptyState, LoadingScreen, PageHeader, StatCard, priorityBadge, statusBadge } from '../components/common'
import AnalyticsPanels from '../components/AnalyticsPanels'
import useDashboard from '../hooks/dashboard/useDashboard'

export default function Dashboard() {
  const {
    navigate,
    user,
    counts,
    projects,
    recentTasks,
    upcomingTasks,
    completionTrend,
    statusChart,
    loading,
    error,
    month,
    today,
    calendarCells,
    hasTask,
    loadDashboard,
  } = useDashboard()
  const greeting = dayjs().hour() < 12 ? 'Good morning' : dayjs().hour() < 18 ? 'Good afternoon' : 'Good evening'

  const header = <PageHeader title={<>{greeting}{user?.name ? `, ${user.name}` : ''}! <span className="inline-block">👋</span></>} subtitle="Here's what's happening with your tasks today." action={<button onClick={() => navigate('/tasks/new')} className="primary-btn"><Plus size={17} />Create Task</button>} />

  if (loading) return <>{header}<LoadingScreen /></>
  if (error) return <>{header}<section className="card"><EmptyState title="Unable to load dashboard" message={error} action={<button className="primary-btn" onClick={loadDashboard}>Try Again</button>} /></section></>

  return <>
    {header}
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Total Tasks" value={counts.total} icon={<ListTodo />} /><StatCard label="Completed" value={counts.completed} icon={<CheckSquare />} tone="green" /><StatCard label="In Progress" value={counts.inProgress} icon={<Clock3 />} tone="amber" /><StatCard label="Overdue" value={counts.overdue} icon={<Square />} tone="red" /></div>
    <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,2.2fr)_minmax(320px,1fr)]">
      <div className="space-y-5">
        <section className="card p-5 sm:p-6"><h2 className="text-xl font-bold">My Projects</h2>{projects.length ? <div className="mt-5 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">{projects.map((project) => <button key={project.id} onClick={() => navigate(`/projects/${project.id}`)} className="rounded-xl border border-[#e2e7f1] p-5 text-left transition hover:-translate-y-1 hover:shadow-lg"><div className="flex items-start gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl text-white" style={{ background: project.color }}>▣</span><div className="min-w-0"><h3 className="font-bold">{project.name}</h3><p className="text-xs text-muted">{project.taskCount} tasks · {project.memberIds.length} members</p></div><span className="badge badge-green ml-auto">{project.status}</span></div><div className="progress mt-6"><span style={{ width: `${project.progress}%`, background: project.color }} /></div><div className="mt-4 flex items-center justify-between"><div className="flex -space-x-2">{project.members.slice(0, 3).map((member) => <Avatar key={member.id} member={member} size={26} className="border-2 border-white" />)}</div><span className="text-sm text-muted">{project.progress}%</span></div>{project.dueDate && <p className="mt-2 text-xs text-muted">▤ {dayjs(project.dueDate).format('MMM D, YYYY')}</p>}</button>)}</div> : <EmptyState title="No projects found" message="Projects will appear here when they are created." />}</section>
        <section className="card overflow-hidden p-5 sm:p-6"><h2 className="text-xl font-bold">Recent Tasks</h2>{recentTasks.length ? <div className="mt-4 overflow-x-auto"><table className="responsive-table"><tbody>{recentTasks.map((task, index) => <tr key={task.id} onClick={() => navigate(`/tasks/${task.id}`)} className="cursor-pointer hover:bg-[#fafbfe]"><td data-label="#" className="text-sm text-[#64728e]">{index + 1}</td><td data-label="Task" className="font-semibold">{task.title}</td><td data-label="Assignees"><span className="flex items-center gap-2 text-sm text-[#586783]"><span className="flex -space-x-2">{task.assignees.slice(0, 3).map((assignee) => <Avatar key={assignee.id} member={assignee} size={24} className="border-2 border-white" />)}</span><span className="max-w-[170px] truncate">{task.assignees.map((assignee) => assignee.name).join(', ') || 'Unassigned'}</span></span></td><td data-label="Status"><span className={statusBadge(task.status)}>{task.status}</span></td><td data-label="Priority"><span className={priorityBadge(task.priority)}>{task.priority}</span></td><td data-label="Due" className="text-sm text-[#586783]">{task.dueDate ? dayjs(task.dueDate).format('MMM D, YYYY') : '—'}</td></tr>)}</tbody></table></div> : <EmptyState title="No recent tasks" message="Recently created tasks will appear here." />}</section>
      </div>
      <div className="space-y-5">
        <MiniCalendar month={month} today={today} cells={calendarCells} hasTask={hasTask} navigate={navigate} />
        <section className="card p-6"><h2 className="text-xl font-bold">Upcoming Tasks</h2>{upcomingTasks.length ? <div className="mt-4 space-y-4">{upcomingTasks.map((task) => <button key={task.id} onClick={() => navigate(`/tasks/${task.id}`)} className="flex w-full items-center gap-3 text-left"><Square size={14} /><span className="min-w-0 flex-1 truncate">{task.title}</span><span className="text-sm text-[#ff496c]">{dayjs(task.dueDate).format('MMM D')}</span></button>)}</div> : <p className="mt-4 text-sm text-muted">No upcoming tasks.</p>}</section>
      </div>
    </div>
    <AnalyticsPanels completionTrend={completionTrend} statusChart={statusChart} />
  </>
}

function MiniCalendar({ month, today, cells, hasTask, navigate }) {
  return <section className="card p-5 sm:p-6"><h2 className="text-xl font-bold">{month.format('MMMM YYYY')}</h2><div className="mt-5 grid grid-cols-7 gap-2 text-center">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((name) => <div key={name} className="py-1 text-[11px] font-bold uppercase tracking-wide text-muted">{name}</div>)}{cells.map((day, index) => day ? <button onClick={() => hasTask(day) && navigate('/calendar')} key={day} className={`rounded-lg py-2.5 text-sm transition ${today.isSame(month.date(day), 'day') ? 'bg-primary text-white shadow-md shadow-primary/20' : hasTask(day) ? 'bg-[#eceaff] text-primary hover:bg-[#dedaff]' : 'bg-[#f6f7fb] hover:bg-[#eceff6]'}`}>{day}</button> : <span key={`blank-${index}`} />)}</div></section>
}
