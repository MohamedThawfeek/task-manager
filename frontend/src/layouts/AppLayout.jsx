import { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Bell, CalendarDays, ChartNoAxesCombined, ChevronDown, ClipboardList, FolderKanban, LayoutDashboard, Menu, Moon, Search, Settings, Sun, Users, X, LogOut, UserRound } from 'lucide-react'
import toast from 'react-hot-toast'
import { Logo, Avatar } from '../components/common'
import { closeSidebar, toggleSidebar, toggleTheme } from '../features/uiSlice'
import { logout } from '../features/authSlice'
import { markAllRead } from '../features/notificationsSlice'

const nav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/tasks', label: 'My Tasks', icon: ClipboardList },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/team', label: 'Team', icon: Users },
  { to: '/reports', label: 'Reports', icon: ChartNoAxesCombined },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export default function AppLayout() {
  const dispatch = useDispatch(); const navigate = useNavigate()
  const { theme, sidebarOpen } = useSelector((s) => s.ui)
  const user = useSelector((s) => s.auth.user)
  const notifications = useSelector((s) => s.notifications.items)
  const tasks = useSelector((s) => s.workspace.tasks)
  const projects = useSelector((s) => s.workspace.projects)
  const [noticeOpen, setNoticeOpen] = useState(false); const [profileOpen, setProfileOpen] = useState(false); const [query, setQuery] = useState(''); const [resultsOpen, setResultsOpen] = useState(false)
  useEffect(() => { document.documentElement.classList.toggle('dark', theme === 'dark') }, [theme])
  const results = query.trim() ? [...tasks.map((x) => ({ ...x, kind: 'Task', path: `/tasks/${x.id}` })), ...projects.map((x) => ({ ...x, title: x.name, kind: 'Project', path: `/projects/${x.id}` }))].filter((x) => x.title.toLowerCase().includes(query.toLowerCase())).slice(0, 7) : []
  const unread = notifications.filter((item) => !item.read).length
  const signOut = () => { dispatch(logout()); toast.success('Signed out'); navigate('/login') }
  return <div className="app-shell flex min-h-screen">
    {sidebarOpen && <button className="fixed inset-0 z-40 bg-black/40 lg:hidden" aria-label="Close navigation" onClick={() => dispatch(closeSidebar())} />}
    <aside className={`fixed inset-y-0 left-0 z-50 flex w-[235px] flex-col bg-sidebar px-[18px] py-8 text-[#d9e0f3] transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex items-center justify-between px-2 text-white"><Logo /><button className="lg:hidden" onClick={() => dispatch(closeSidebar())}><X size={22} /></button></div>
      <nav className="mt-12 space-y-2">
        {nav.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} onClick={() => dispatch(closeSidebar())} className={({ isActive }) => `flex items-center gap-4 rounded-[11px] px-4 py-[15px] text-[15px] font-medium transition ${isActive ? 'bg-primary text-white shadow-lg shadow-primary/10' : 'hover:bg-white/7'}`}><Icon size={19} strokeWidth={1.8} />{label}</NavLink>)}
      </nav>
    </aside>
    <div className="min-w-0 flex-1 lg:ml-[235px]">
      <header className="topbar sticky top-0 z-30 flex h-[88px] items-center gap-3 border-b border-[#e7ebf3] bg-white px-4 sm:px-8">
        <button className="rounded-lg p-2 hover:bg-[#f3f5fa] lg:hidden" onClick={() => dispatch(toggleSidebar())}><Menu /></button>
        <div className="relative w-full max-w-[480px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8d9ab4]" size={16} />
          <input value={query} onChange={(e) => { setQuery(e.target.value); setResultsOpen(true) }} onFocus={() => setResultsOpen(true)} className="field border-0 bg-[#f3f5fa] pl-10" placeholder="Search tasks, projects, or people..." />
          {resultsOpen && query && <div className="surface absolute top-[58px] left-0 w-full overflow-hidden shadow-xl">{results.length ? results.map((r) => <button key={`${r.kind}-${r.id}`} onClick={() => { navigate(r.path); setQuery(''); setResultsOpen(false) }} className="flex w-full items-center justify-between border-b border-[#edf0f5] px-4 py-3 text-left last:border-0 hover:bg-[#f7f8fc]"><span className="font-semibold">{r.title}</span><span className="text-xs text-muted">{r.kind}</span></button>) : <p className="p-4 text-sm text-muted">No matches found</p>}</div>}
        </div>
        <div className="ml-auto flex items-center gap-2 sm:gap-4">
          <button className="rounded-full p-2 text-[#6f7d98] hover:bg-[#f2f4fa]" onClick={() => dispatch(toggleTheme())} aria-label="Toggle theme">{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}</button>
          <div className="relative"><button className="relative rounded-full p-2 text-[#6f7d98] hover:bg-[#f2f4fa]" onClick={() => { setNoticeOpen(!noticeOpen); setProfileOpen(false) }} aria-label="Notifications"><Bell size={18} />{unread > 0 && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#ff496c]" />}</button>
            {noticeOpen && <div className="surface absolute right-0 top-12 w-[min(360px,calc(100vw-2rem))] p-4 shadow-xl"><div className="flex items-center justify-between"><h3 className="font-bold">Notifications</h3><button className="text-xs font-semibold text-primary" onClick={() => dispatch(markAllRead())}>Mark all read</button></div><div className="mt-2">{notifications.map((n) => <div key={n.id} className="border-b border-[#edf0f5] py-3 last:border-0"><div className="flex gap-2"><span className={`mt-1.5 h-2 w-2 rounded-full ${n.read ? 'bg-[#cad2e0]' : 'bg-primary'}`} /><div><p className="text-sm font-bold">{n.title}</p><p className="mt-1 text-xs leading-5 text-muted">{n.message}</p><p className="mt-1 text-[11px] text-muted">{n.time} ago</p></div></div></div>)}</div></div>}
          </div>
          <div className="relative"><button className="flex items-center gap-2 text-left" onClick={() => { setProfileOpen(!profileOpen); setNoticeOpen(false) }}><Avatar member={{ name: user?.name, avatar: user?.name?.split(' ').map(n => n[0]).join('') }} size={44} /><span className="hidden md:block"><strong className="block text-sm">{user?.name || 'Sarah Khan'}</strong><span className="text-xs text-muted">{user?.jobTitle || 'Product Manager'}</span></span><ChevronDown size={15} /></button>
            {profileOpen && <div className="surface absolute right-0 top-14 w-48 p-2 shadow-xl"><button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-[#f3f5fa]" onClick={() => navigate('/profile')}><UserRound size={16} />My Profile</button><button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#ef476f] hover:bg-[#fff1f4]" onClick={signOut}><LogOut size={16} />Sign out</button></div>}
          </div>
        </div>
      </header>
      <main className="page-bg min-h-[calc(100vh-88px)] p-4 sm:p-7 lg:px-[38px] lg:py-9"><Outlet /></main>
    </div>
  </div>
}
