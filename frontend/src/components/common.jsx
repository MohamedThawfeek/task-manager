import { useEffect } from 'react'
import { X, Inbox, LoaderCircle } from 'lucide-react'

export function Logo({ compact = false }) {
  return <div className="flex items-center gap-2.5 font-extrabold text-2xl tracking-tight">
    <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-primary text-white">✓</span>
    {!compact && <span>Task<span className="text-[#6e61ff]">Flow</span></span>}
  </div>
}

export function PageHeader({ title, subtitle, action }) {
  return <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
    <div><h1 className="page-title">{title}</h1>{subtitle && <p className="page-subtitle">{subtitle}</p>}</div>
    {action}
  </div>
}

export function Modal({ open, onClose, title, children, size = '620px' }) {
  useEffect(() => {
    if (!open) return undefined
    const close = (event) => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [open, onClose])
  if (!open) return null
  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <section className="modal-card" style={{ maxWidth: size }} role="dialog" aria-modal="true" aria-label={title}>
      <header className="flex items-center justify-between border-b border-[#e8ecf3] px-6 py-5 divider">
        <h2 className="text-xl font-bold">{title}</h2>
        <button className="rounded-lg p-2 text-muted hover:bg-[#f1f3f9]" onClick={onClose} aria-label="Close modal"><X size={20} /></button>
      </header>
      <div className="p-6">{children}</div>
    </section>
  </div>
}

export function ConfirmModal({ open, onClose, onConfirm, title = 'Are you sure?', body = 'This action cannot be undone.', confirmLabel = 'Delete' }) {
  return <Modal open={open} onClose={onClose} title={title} size="440px">
    <p className="muted text-[#7785a0]">{body}</p>
    <div className="mt-6 flex justify-end gap-3"><button className="secondary-btn" onClick={onClose}>Cancel</button><button className="danger-btn" onClick={() => { onConfirm(); onClose() }}>{confirmLabel}</button></div>
  </Modal>
}

export function StatCard({ label, value, icon, tone = 'violet', change }) {
  const tones = { violet: 'bg-[#eeecff] text-[#594cff]', green: 'bg-[#e6f8f0] text-[#11b97a]', blue: 'bg-[#e6f3ff] text-[#2688f6]', amber: 'bg-[#fff4df] text-[#f6a500]', red: 'bg-[#ffecef] text-[#ff496c]' }
  return <div className="card flex min-h-[112px] items-center gap-4 p-5 sm:p-6">
    <span className={`grid h-12 w-12 place-items-center rounded-xl ${tones[tone]}`}>{icon}</span>
    <div><p className="text-xs text-[#8290ad]">{label}</p><p className="mt-0.5 text-[1.9rem] font-bold leading-tight">{value}</p>{change && <p className="mt-1 text-xs text-[#8290ad]">{change}</p>}</div>
  </div>
}

export function EmptyState({ title = 'Nothing here yet', message = 'Create your first item to get started.', action }) {
  return <div className="grid min-h-[250px] place-items-center p-8 text-center">
    <div><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#eeecff] text-primary"><Inbox /></span><h3 className="mt-4 text-lg font-bold">{title}</h3><p className="mt-1 text-sm text-muted">{message}</p>{action && <div className="mt-5">{action}</div>}</div>
  </div>
}

export function LoadingScreen() {
  return <div className="grid min-h-[55vh] place-items-center text-primary"><LoaderCircle className="animate-spin" size={34} /></div>
}

export function Avatar({ member, size = 34, className = '' }) {
  return <span className={`avatar ${className}`} style={{ width: size, height: size, fontSize: Math.max(10, size * .31) }} title={member?.name}>{member?.avatar || member?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2) || '?'}</span>
}

export const priorityBadge = (priority) => priority === 'High' ? 'badge badge-red' : priority === 'Medium' ? 'badge badge-yellow' : 'badge badge-green'
export const statusBadge = (status) => status === 'Done' ? 'badge badge-green' : status === 'Review' ? 'badge badge-yellow' : status === 'In Progress' ? 'badge badge-blue' : 'badge bg-[#eeecff] text-primary'
