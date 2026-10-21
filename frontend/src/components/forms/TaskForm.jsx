import { useState } from 'react'
import { FormikProvider } from 'formik'
import { Paperclip, Plus, Trash2 } from 'lucide-react'
import useFormikForm from '../formik/useFormikForm'
import {
  FormikDatePicker,
  FormikDropdown,
  FormikError,
  FormikInput,
  FormikMultiSelect,
  FormikTextarea,
} from '../formik/FormikFields'
import { taskSchema } from '../../validations/forms'

export default function TaskForm({
  initial,
  projects,
  team,
  onSubmit,
  submitLabel = 'Create Task',
}) {
  const [checklist, setChecklist] = useState(initial?.checklist || [])
  const [checkText, setCheckText] = useState('')
  const [attachments, setAttachments] = useState(initial?.attachments || [])
  const initialAssigneeIds = Array.isArray(initial?.assigneeIds)
    ? initial.assigneeIds
    : initial?.assigneeId
      ? [initial.assigneeId]
      : []
  const formik = useFormikForm({
    initialValues: {
      title: '',
      projectId: '',
      priority: 'Medium',
      status: 'To Do',
      dueDate: '',
      description: '',
      ...initial,
      assigneeIds: initialAssigneeIds,
    },
    validationSchema: taskSchema,
    enableReinitialize: true,
    onSubmit: async (values) => onSubmit({
      ...values,
      assigneeId: undefined,
      checklist,
      attachments,
    }),
  })

  const addCheck = () => {
    if (!checkText.trim()) return
    setChecklist((items) => [
      ...items,
      { id: `c-${Date.now()}`, title: checkText.trim(), completed: false },
    ])
    setCheckText('')
  }
  const upload = (event) => {
    Array.from(event.target.files).slice(0, 3).forEach((file) => {
      if (file.size > 1_500_000) return
      const reader = new FileReader()
      reader.onload = () => setAttachments((items) => [
        ...items,
        { id: `a-${Date.now()}-${file.name}`, name: file.name, type: file.type, url: reader.result, file },
      ])
      reader.readAsDataURL(file)
    })
  }

  return <FormikProvider value={formik}>
    <form onSubmit={formik.handleSubmit} noValidate>
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="label">Title *</label>
          <FormikInput name="title" placeholder="Enter task title" />
          <FormikError name="title" />
        </div>
        <div>
          <label className="label">Assignees *</label>
          <FormikMultiSelect
            name="assigneeIds"
            placeholder="Select assignees"
            options={team.map((member) => ({
              label: member.name,
              value: member.id,
              subtitle: member.role,
              avatar: member.avatar,
            }))}
          />
          <FormikError name="assigneeIds" />
        </div>
        <div>
          <label className="label">Project *</label>
          <FormikDropdown
            name="projectId"
            placeholder="Select project"
            options={projects.map((project) => ({ label: project.name, value: project.id }))}
          />
          <FormikError name="projectId" />
        </div>
        <div>
          <label className="label">Priority</label>
          <FormikDropdown name="priority" options={['Low', 'Medium', 'High']} />
        </div>
        <div className="md:row-span-2">
          <label className="label">Description</label>
          <FormikTextarea name="description" rows="5" className="min-h-[134px] resize-none" placeholder="Enter task description" />
          <FormikError name="description" />
        </div>
        <div>
          <label className="label">Due Date *</label>
          <FormikDatePicker name="dueDate" ariaLabel="Task due date" />
          <FormikError name="dueDate" />
        </div>
        <div>
          <label className="label">Status</label>
          <FormikDropdown name="status" options={['To Do', 'In Progress', 'Review', 'Done']} />
        </div>
      </div>
      <div className="mt-5">
        <label className="label">Checklist Items</label>
        <div className="flex gap-2">
          <input
            value={checkText}
            onChange={(event) => setCheckText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                addCheck()
              }
            }}
            className="field"
            placeholder="Add checklist item"
          />
          <button type="button" className="secondary-btn" onClick={addCheck}><Plus size={18} />Add</button>
        </div>
        {checklist.length > 0 && <div className="mt-2 space-y-1">
          {checklist.map((item) => <div key={item.id} className="flex items-center justify-between rounded-lg bg-[#f6f7fb] px-3 py-2 text-sm">
            <span>{item.title}</span>
            <button type="button" onClick={() => setChecklist((items) => items.filter((entry) => entry.id !== item.id))} className="text-[#ef476f]"><Trash2 size={16} /></button>
          </div>)}
        </div>}
      </div>
      <div className="mt-5">
        <label className="label">Attachments <span className="font-normal text-muted">(max 1.5 MB each)</span></label>
        <label className="secondary-btn w-fit"><Paperclip size={17} />Upload files<input type="file" multiple className="hidden" onChange={upload} /></label>
        {attachments.length > 0 && <div className="mt-2 flex flex-wrap gap-2">
          {attachments.map((attachment) => <span key={attachment.id} className="badge bg-[#f0f2f8] text-[#5e6c88]">
            {attachment.name}
            <button type="button" className="ml-2" onClick={() => setAttachments((items) => items.filter((entry) => entry.id !== attachment.id))}>×</button>
          </span>)}
        </div>}
      </div>
      <div className="mt-7 flex justify-end">
        <button disabled={formik.isSubmitting} className="primary-btn">
          {formik.isSubmitting ? 'Please wait…' : submitLabel}
        </button>
      </div>
    </form>
  </FormikProvider>
}
