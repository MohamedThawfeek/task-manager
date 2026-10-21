import dayjs from 'dayjs'
import { CheckSquare, Clock3, ListTodo, Plus, Square } from 'lucide-react'
import { Avatar, EmptyState, PageHeader, StatCard, priorityBadge, statusBadge } from '../components/common'
import AnalyticsPanels from '../components/AnalyticsPanels'
import { getTaskAssignees } from '../utils/tasks'
import useDashboard from '../hooks/dashboard/useDashboard'

export default function Dashboard() {
  const { navigate, user, tasks, projects, team, completed, inProgress, overdue, member, projectTasks, month, today, calendarCells, hasTask } = useDashboard()
  const greeting = dayjs().hour() < 12 ? 'Good morning' : dayjs().hour() < 18 ? 'Good afternoon' : 'Good evening'
  return <>
    <PageHeader title={<>{greeting}{user?.name ? `, ${user.name}` : ''}! <span className="inline-block">👋</span></>} subtitle="Here's what's happening with your tasks today." action={<button onClick={() => navigate('/tasks/new')} className="primary-btn"><Plus size={17} />Create Task</button>} />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Total Tasks" value={tasks.length} icon={<ListTodo />} /><StatCard label="Completed" value={completed} icon={<CheckSquare />} tone="green" /><StatCard label="In Progress" value={inProgress} icon={<Clock3 />} tone="amber" /><StatCard label="Overdue" value={overdue} icon={<Square />} tone="red" /></div>
    <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,2.2fr)_minmax(320px,1fr)]">
      <div className="space-y-5">
        <section className="card p-5 sm:p-6"><h2 className="text-xl font-bold">My Projects</h2>{projects.length ? <div className="mt-5 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">{projects.slice(0, 3).map((p) => <button key={p.id} onClick={() => navigate(`/projects/${p.id}`)} className="rounded-xl border border-[#e2e7f1] p-5 text-left transition hover:-translate-y-1 hover:shadow-lg"><div className="flex items-start gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl text-white" style={{ background: p.color }}>▣</span><div className="min-w-0"><h3 className="font-bold">{p.name}</h3><p className="text-xs text-muted">{projectTasks(p.id).length} tasks · {p.memberIds.length} members</p></div><span className="badge badge-green ml-auto">{p.status}</span></div><div className="progress mt-6"><span style={{ width: `${p.progress}%`, background: p.color }} /></div><div className="mt-4 flex items-center justify-between"><div className="flex -space-x-2">{p.memberIds.slice(0, 3).map((id) => <Avatar key={id} member={member(id)} size={26} className="border-2 border-white" />)}</div><span className="text-sm text-muted">{p.progress}%</span></div>{p.dueDate && <p className="mt-2 text-xs text-muted">▤ {dayjs(p.dueDate).format('MMM D, YYYY')}</p>}</button>)}</div> : <EmptyState title="No projects found" message="Projects assigned to you will appear here." />}</section>
        <section className="card overflow-hidden p-5 sm:p-6"><h2 className="text-xl font-bold">Recent Tasks</h2><div className="mt-4 overflow-x-auto"><table className="responsive-table"><tbody>{tasks.slice(0, 5).map((task, i) => { const assignees = getTaskAssignees(task, team); return <tr key={task.id} onClick={() => navigate(`/tasks/${task.id}`)} className="cursor-pointer hover:bg-[#fafbfe]"><td data-label="#" className="text-sm text-[#64728e]">{i + 1}</td><td data-label="Task" className="font-semibold">{task.title}</td><td data-label="Assignees"><span className="flex items-center gap-2 text-sm text-[#586783]"><span className="flex -space-x-2">{assignees.slice(0, 3).map((assignee) => <Avatar key={assignee.id} member={assignee} size={24} className="border-2 border-white" />)}</span><span className="max-w-[170px] truncate">{assignees.map((assignee) => assignee.name).join(', ') || 'Unassigned'}</span></span></td><td data-label="Status"><span className={statusBadge(task.status)}>{task.status}</span></td><td data-label="Priority"><span className={priorityBadge(task.priority)}>{task.priority}</span></td><td data-label="Due" className="text-sm text-[#586783]">{dayjs(task.dueDate).format('MMM D, YYYY')}</td></tr> })}</tbody></table></div></section>
      </div>
      <div className="space-y-5">
        <MiniCalendar month={month} today={today} cells={calendarCells} hasTask={hasTask} navigate={navigate} />
        <section className="card p-6"><h2 className="text-xl font-bold">Upcoming Tasks</h2><div className="mt-4 space-y-4">{tasks.filter((t) => t.status !== 'Done').slice(0, 5).map((task) => <button key={task.id} onClick={() => navigate(`/tasks/${task.id}`)} className="flex w-full items-center gap-3 text-left"><Square size={14} /><span className="min-w-0 flex-1 truncate">{task.title}</span><span className="text-sm text-[#ff496c]">{dayjs(task.dueDate).isSame(dayjs(), 'day') ? 'Today' : dayjs(task.dueDate).format('MMM D')}</span></button>)}</div></section>
      </div>
    </div>
    <AnalyticsPanels tasks={tasks} />
  </>
}

function MiniCalendar({ month, today, cells, hasTask, navigate }) {
  return <section className="card p-5 sm:p-6"><h2 className="text-xl font-bold">{month.format('MMMM YYYY')}</h2><div className="mt-5 grid grid-cols-7 gap-2 text-center">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((name) => <div key={name} className="py-1 text-[11px] font-bold uppercase tracking-wide text-muted">{name}</div>)}{cells.map((day, index) => day ? <button onClick={() => hasTask(day) && navigate('/calendar')} key={day} className={`rounded-lg py-2.5 text-sm transition ${today.isSame(month.date(day), 'day') ? 'bg-primary text-white shadow-md shadow-primary/20' : hasTask(day) ? 'bg-[#eceaff] text-primary hover:bg-[#dedaff]' : 'bg-[#f6f7fb] hover:bg-[#eceff6]'}`}>{day}</button> : <span key={`blank-${index}`} />)}</div></section>
}
