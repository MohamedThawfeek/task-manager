import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Paperclip, Plus, Trash2 } from 'lucide-react'
import Dropdown from './Dropdown'
import MultiSelectDropdown from './MultiSelectDropdown'

const taskSchema = z.object({ title: z.string().min(3, 'Title must contain at least 3 characters'), projectId: z.string().min(1, 'Select a project'), assigneeIds: z.array(z.string()).min(1, 'Select at least one assignee'), priority: z.enum(['Low', 'Medium', 'High']), status: z.enum(['To Do', 'In Progress', 'Review', 'Done']), dueDate: z.string().min(1, 'Choose a due date'), description: z.string().max(600).optional() })

export function TaskForm({ initial, projects, team, onSubmit, submitLabel = 'Create Task' }) {
  const [checklist, setChecklist] = useState(initial?.checklist || []); const [checkText, setCheckText] = useState(''); const [attachments, setAttachments] = useState(initial?.attachments || [])
  const initialAssigneeIds = Array.isArray(initial?.assigneeIds) ? initial.assigneeIds : initial?.assigneeId ? [initial.assigneeId] : []
  const { control, register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(taskSchema), defaultValues: { title: '', projectId: '', priority: 'Medium', status: 'To Do', dueDate: '', description: '', ...initial, assigneeIds: initialAssigneeIds } })
  const addCheck = () => { if (!checkText.trim()) return; setChecklist((items) => [...items, { id: `c-${Date.now()}`, title: checkText.trim(), completed: false }]); setCheckText('') }
  const upload = (event) => { [...event.target.files].slice(0, 3).forEach((file) => { if (file.size > 1_500_000) return; const reader = new FileReader(); reader.onload = () => setAttachments((items) => [...items, { id: `a-${Date.now()}-${file.name}`, name: file.name, type: file.type, url: reader.result }]); reader.readAsDataURL(file) }) }
  const submit = (data) => onSubmit({ ...data, assigneeId: undefined, checklist, attachments })
  return <form onSubmit={handleSubmit(submit)}>
    <div className="grid gap-5 md:grid-cols-2">
      <div><label className="label">Title *</label><input className={`field ${errors.title ? 'field-error' : ''}`} placeholder="Enter task title" {...register('title')} />{errors.title && <p className="error-text">{errors.title.message}</p>}</div>
      <div><label className="label">Assignees *</label><Controller control={control} name="assigneeIds" render={({ field }) => <MultiSelectDropdown value={field.value} onChange={field.onChange} onBlur={field.onBlur} error={!!errors.assigneeIds} placeholder="Select assignees" options={team.map((member) => ({ label: member.name, value: member.id, subtitle: member.role, avatar: member.avatar }))} />} />{errors.assigneeIds && <p className="error-text">{errors.assigneeIds.message}</p>}</div>
      <div><label className="label">Project *</label><Controller control={control} name="projectId" render={({ field }) => <Dropdown value={field.value} onChange={field.onChange} onBlur={field.onBlur} error={!!errors.projectId} placeholder="Select project" options={projects.map((project) => ({ label: project.name, value: project.id }))} />} />{errors.projectId && <p className="error-text">{errors.projectId.message}</p>}</div>
      <div><label className="label">Priority</label><Controller control={control} name="priority" render={({ field }) => <Dropdown value={field.value} onChange={field.onChange} onBlur={field.onBlur} options={['Low', 'Medium', 'High']} />} /></div>
      <div className="md:row-span-2"><label className="label">Description</label><textarea rows="5" className="field min-h-[134px] resize-none" placeholder="Enter task description" {...register('description')} /></div>
      <div><label className="label">Due Date *</label><input type="date" className={`field ${errors.dueDate ? 'field-error' : ''}`} {...register('dueDate')} />{errors.dueDate && <p className="error-text">{errors.dueDate.message}</p>}</div>
      <div><label className="label">Status</label><Controller control={control} name="status" render={({ field }) => <Dropdown value={field.value} onChange={field.onChange} onBlur={field.onBlur} options={['To Do', 'In Progress', 'Review', 'Done']} />} /></div>
    </div>
    <div className="mt-5"><label className="label">Checklist Items</label><div className="flex gap-2"><input value={checkText} onChange={(e) => setCheckText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCheck() } }} className="field" placeholder="Add checklist item" /><button type="button" className="secondary-btn" onClick={addCheck}><Plus size={18} />Add</button></div>{checklist.length > 0 && <div className="mt-2 space-y-1">{checklist.map((item) => <div key={item.id} className="flex items-center justify-between rounded-lg bg-[#f6f7fb] px-3 py-2 text-sm"><span>{item.title}</span><button type="button" onClick={() => setChecklist((items) => items.filter((x) => x.id !== item.id))} className="text-[#ef476f]"><Trash2 size={16} /></button></div>)}</div>}</div>
    <div className="mt-5"><label className="label">Attachments <span className="font-normal text-muted">(max 1.5 MB each)</span></label><label className="secondary-btn w-fit"><Paperclip size={17} />Upload files<input type="file" multiple className="hidden" onChange={upload} /></label>{attachments.length > 0 && <div className="mt-2 flex flex-wrap gap-2">{attachments.map((a) => <span key={a.id} className="badge bg-[#f0f2f8] text-[#5e6c88]">{a.name}<button type="button" className="ml-2" onClick={() => setAttachments((items) => items.filter((x) => x.id !== a.id))}>×</button></span>)}</div>}</div>
    <div className="mt-7 flex justify-end"><button disabled={isSubmitting} className="primary-btn">{submitLabel}</button></div>
  </form>
}

const projectSchema = z.object({ name: z.string().min(3, 'Enter a project name'), description: z.string().min(10, 'Add a short description'), status: z.enum(['Active', 'Completed', 'Archived']), progress: z.coerce.number().min(0).max(100), memberIds: z.array(z.string()).min(1, 'Select at least one user'), dueDate: z.string().min(1, 'Choose a due date') })
export function ProjectForm({ initial, onSubmit, team = [] }) {
  const { control, register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(projectSchema), defaultValues: { name: '', description: '', status: 'Active', progress: 0, memberIds: [], dueDate: '', ...initial } })
  return <form onSubmit={handleSubmit(onSubmit)} className="space-y-4"><div><label className="label">Project name</label><input className="field" {...register('name')} />{errors.name && <p className="error-text">{errors.name.message}</p>}</div><div><label className="label">Description</label><textarea className="field min-h-[100px]" {...register('description')} />{errors.description && <p className="error-text">{errors.description.message}</p>}</div><div className="grid grid-cols-2 gap-4"><div><label className="label">Status</label><Controller control={control} name="status" render={({ field }) => <Dropdown value={field.value} onChange={field.onChange} onBlur={field.onBlur} options={['Active', 'Completed', 'Archived']} />} /></div><div><label className="label">Progress</label><input type="number" className="field" {...register('progress')} /></div></div><div><label className="label">Users *</label><Controller control={control} name="memberIds" render={({ field }) => <MultiSelectDropdown value={field.value} onChange={field.onChange} onBlur={field.onBlur} error={!!errors.memberIds} options={team.map((member) => ({ label: member.name, value: member.id, subtitle: member.role, avatar: member.avatar }))} />} />{errors.memberIds && <p className="error-text">{errors.memberIds.message}</p>}</div><div><label className="label">Due date</label><input type="date" className="field" {...register('dueDate')} />{errors.dueDate && <p className="error-text">{errors.dueDate.message}</p>}</div><button className="primary-btn mt-2 w-full">{initial ? 'Save Project' : 'Create Project'}</button></form>
}

const memberSchema = (editing) => z.object({
  name: z.string().min(2, 'Enter a name'),
  email: z.email('Enter a valid email'),
  password: editing
    ? z.string().refine((value) => !value || value.length >= 8, 'Use at least 8 characters')
    : z.string().min(8, 'Use at least 8 characters'),
  phone: z.string().min(7, 'Enter a valid phone number').max(20, 'Phone number is too long').regex(/^[+0-9()\s-]+$/, 'Enter a valid phone number'),
  role: z.string().min(2, 'Enter a role'),
  access: z.enum(['User', 'Admin']),
  status: z.enum(['Active', 'Inactive']),
})
export function MemberForm({ initial, onSubmit }) {
  const [showPassword, setShowPassword] = useState(false)
  const normalizedStatus = initial?.status === 'Inactive' || String(initial?.status).toLowerCase() === 'inactive' ? 'Inactive' : 'Active'
  const { control, register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(memberSchema(!!initial)), defaultValues: { name: initial?.name || '', email: initial?.email || '', password: '', phone: initial?.phone || '', role: initial?.role || '', access: initial?.access || 'User', status: normalizedStatus } })
  return <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
    <div className="grid gap-4 sm:grid-cols-2">
      <div><label className="label">Name</label><input className={`field ${errors.name ? 'field-error' : ''}`} placeholder="Full name" {...register('name')} />{errors.name && <p className="error-text">{errors.name.message}</p>}</div>
      <div><label className="label">Email</label><input type="email" className={`field ${errors.email ? 'field-error' : ''}`} placeholder="name@company.com" {...register('email')} />{errors.email && <p className="error-text">{errors.email.message}</p>}</div>
      <div><label className="label">Password</label><div className="relative"><input type={showPassword ? 'text' : 'password'} className={`field pr-11 ${errors.password ? 'field-error' : ''}`} placeholder={initial ? 'Leave blank to keep current' : 'Minimum 8 characters'} {...register('password')} /><button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>{errors.password && <p className="error-text">{errors.password.message}</p>}</div>
      <div><label className="label">Phone</label><input type="tel" className={`field ${errors.phone ? 'field-error' : ''}`} placeholder="+1 555 0123" {...register('phone')} />{errors.phone && <p className="error-text">{errors.phone.message}</p>}</div>
    </div>
    <div><label className="label">Role</label><input className={`field ${errors.role ? 'field-error' : ''}`} placeholder="e.g. Product Manager" {...register('role')} />{errors.role && <p className="error-text">{errors.role.message}</p>}</div>
    <div className="grid gap-4 sm:grid-cols-2">
      <div><label className="label">Access</label><Controller control={control} name="access" render={({ field }) => <Dropdown value={field.value} onChange={field.onChange} onBlur={field.onBlur} options={['User', 'Admin']} />} /></div>
      <div><label className="label">Status</label><Controller control={control} name="status" render={({ field }) => <Dropdown value={field.value} onChange={field.onChange} onBlur={field.onBlur} options={['Active', 'Inactive']} />} /></div>
    </div>
    <button className="primary-btn w-full">{initial ? 'Save Member' : 'Create Member'}</button>
  </form>
}
