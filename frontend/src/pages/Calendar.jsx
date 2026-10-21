import dayjs from 'dayjs'
import { PageHeader } from '../components/common'
import useCalendar from '../hooks/calendar/useCalendar'

export default function CalendarPage() {
  const { tasks, navigate, view, setView, month, cells, renderEvents, weekDays, hours } = useCalendar()
  return <><PageHeader title="Calendar" subtitle="View your tasks and deadlines" /><section className="card p-5 sm:p-6"><div className="mb-8 flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-bold">{month.format('MMMM YYYY')}</h2><div className="flex gap-2">{['Month','Week','Day'].map((x) => <button className={`tab ${view === x ? 'active' : ''}`} onClick={() => setView(x)} key={x}>{x}</button>)}</div></div>
    {view === 'Month' && <div className="overflow-x-auto"><div className="calendar-grid">{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d) => <div key={d} className="calendar-cell calendar-label">{d}</div>)}{cells.map((day, i) => <div className="calendar-cell" key={`${day}-${i}`}>{day && <><span className="text-sm text-[#63718c]">{day}</span>{renderEvents(day).slice(0, 2).map((t) => <button onClick={() => navigate(`/tasks/${t.id}`)} className="calendar-event block w-full text-left" key={t.id}>{t.title}</button>)}</>}</div>)}</div></div>}
    {view === 'Week' && <div className="grid min-w-[720px] grid-cols-7 overflow-x-auto rounded-xl border border-[#e1e6f0]">{weekDays.map((date) => <div className="min-h-[430px] border-r border-[#e1e6f0] p-3 last:border-0" key={date.format('YYYY-MM-DD')}><p className="text-center text-sm font-bold">{date.format('ddd')}<span className="mt-1 block text-xl">{date.date()}</span></p>{renderEvents(date.date()).map((t) => <button onClick={() => navigate(`/tasks/${t.id}`)} className="calendar-event mt-5 block w-full whitespace-normal text-left" key={t.id}>{t.title}</button>)}</div>)}</div>}
    {view === 'Day' && <div className="divide-y divide-[#e5e9f1] rounded-xl border border-[#e1e6f0]">{hours.map((hour) => <div className="grid min-h-[62px] grid-cols-[80px_1fr]" key={hour}><span className="border-r border-[#e5e9f1] p-3 text-sm text-muted">{dayjs().hour(hour).minute(0).format('h A')}</span><div className="p-2">{hour === 10 && tasks[0] && <button className="calendar-event px-5" onClick={() => navigate(`/tasks/${tasks[0].id}`)}>Team task review</button>}</div></div>)}</div>}
  </section></>
}
