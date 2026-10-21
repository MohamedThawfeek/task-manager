import { Paperclip, Plus, Trash2 } from "lucide-react";
import DatePickerField from "../DatePickerField";
import Dropdown from "../Dropdown";
import MultiSelectDropdown from "../MultiSelectDropdown";

function FieldError({ form, name }) {
  if (!form.touched[name] || !form.errors[name]) return null;
  return <p className="error-text">{form.errors[name]}</p>;
}

export default function TaskForm({
  form,
  projects,
  team,
  checklist,
  checkText,
  setCheckText,
  addChecklistItem,
  removeChecklistItem,
  attachments,
  uploadAttachments,
  removeAttachment,
  submitLabel = "Create Task",
}) {
  return (
    <form onSubmit={form.handleSubmit} noValidate>
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="label" htmlFor="title">Title *</label>
          <input id="title" name="title" value={form.values.title} onChange={form.handleChange} onBlur={form.handleBlur} className={`field ${form.touched.title && form.errors.title ? "field-error" : ""}`} placeholder="Enter task title" />
          <FieldError form={form} name="title" />
        </div>
        <div>
          <label className="label">Assignees *</label>
          <MultiSelectDropdown value={form.values.assigneeIds} onChange={(value) => form.setFieldValue("assigneeIds", value)} placeholder="Select assignees" options={team.map((member) => ({ label: member.name, value: member.id, subtitle: member.role, avatar: member.avatar }))} error={Boolean(form.touched.assigneeIds && form.errors.assigneeIds)} />
          <FieldError form={form} name="assigneeIds" />
        </div>
        <div>
          <label className="label">Project *</label>
          <Dropdown value={form.values.projectId} onChange={(value) => form.setFieldValue("projectId", value)} placeholder="Select project" options={projects.map((project) => ({ label: project.name, value: project.id }))} error={Boolean(form.touched.projectId && form.errors.projectId)} />
          <FieldError form={form} name="projectId" />
        </div>
        <div>
          <label className="label">Priority</label>
          <Dropdown value={form.values.priority} onChange={(value) => form.setFieldValue("priority", value)} options={["Low", "Medium", "High"]} />
        </div>
        <div className="md:row-span-2">
          <label className="label" htmlFor="description">Description</label>
          <textarea id="description" name="description" rows="5" value={form.values.description} onChange={form.handleChange} onBlur={form.handleBlur} className={`field min-h-[134px] resize-none ${form.touched.description && form.errors.description ? "field-error" : ""}`} placeholder="Enter task description" />
          <FieldError form={form} name="description" />
        </div>
        <div>
          <label className="label">Due Date *</label>
          <DatePickerField value={form.values.dueDate} onChange={(value) => form.setFieldValue("dueDate", value)} ariaLabel="Task due date" error={Boolean(form.touched.dueDate && form.errors.dueDate)} />
          <FieldError form={form} name="dueDate" />
        </div>
        <div>
          <label className="label">Status</label>
          <Dropdown value={form.values.status} onChange={(value) => form.setFieldValue("status", value)} options={["To Do", "In Progress", "Review", "Done"]} />
        </div>
      </div>

      <div className="mt-5">
        <label className="label" htmlFor="checklistItem">Checklist Items</label>
        <div className="flex gap-2">
          <input id="checklistItem" value={checkText} onChange={(event) => setCheckText(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addChecklistItem(); } }} className="field" placeholder="Add checklist item" />
          <button type="button" className="secondary-btn" onClick={addChecklistItem}><Plus size={18} />Add</button>
        </div>
        {checklist.length > 0 && (
          <div className="mt-2 space-y-1">
            {checklist.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-lg bg-[#f6f7fb] px-3 py-2 text-sm">
                <span>{item.title}</span>
                <button type="button" onClick={() => removeChecklistItem(item.id)} className="text-[#ef476f]" aria-label={`Remove ${item.title}`}><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-5">
        <label className="label">Attachments <span className="font-normal text-muted">(max 1.5 MB each)</span></label>
        <label className="secondary-btn w-fit"><Paperclip size={17} />Upload files<input type="file" multiple className="hidden" onChange={uploadAttachments} /></label>
        {attachments.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {attachments.map((attachment) => (
              <span key={attachment.id} className="badge bg-[#f0f2f8] text-[#5e6c88]">
                {attachment.name}
                <button type="button" className="ml-2" onClick={() => removeAttachment(attachment.id)} aria-label={`Remove ${attachment.name}`}>×</button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-7 flex justify-end">
        <button disabled={form.isSubmitting} className="primary-btn">
          {form.isSubmitting ? "Please wait…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
