import DatePickerField from "../DatePickerField";
import Dropdown from "../Dropdown";
import MultiSelectDropdown from "../MultiSelectDropdown";

function FieldError({ form, name }) {
  if (!form.touched[name] || !form.errors[name]) return null;
  return <p className="error-text">{form.errors[name]}</p>;
}

export default function ProjectForm({ form, team = [], editing = false }) {
  return (
    <form onSubmit={form.handleSubmit} className="space-y-4" noValidate>
      <div>
        <label className="label" htmlFor="name">Project name</label>
        <input id="name" name="name" value={form.values.name} onChange={form.handleChange} onBlur={form.handleBlur} className={`field ${form.touched.name && form.errors.name ? "field-error" : ""}`} />
        <FieldError form={form} name="name" />
      </div>
      <div>
        <label className="label" htmlFor="description">Description</label>
        <textarea id="description" name="description" value={form.values.description} onChange={form.handleChange} onBlur={form.handleBlur} className={`field min-h-25 ${form.touched.description && form.errors.description ? "field-error" : ""}`} />
        <FieldError form={form} name="description" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Status</label>
          <Dropdown value={form.values.status} onChange={(value) => form.setFieldValue("status", value)} options={["Active", "Completed", "Inactive", "Hold"]} error={Boolean(form.touched.status && form.errors.status)} />
          <FieldError form={form} name="status" />
        </div>
        <div>
          <label className="label" htmlFor="progress">Progress</label>
          <input id="progress" name="progress" type="number" min="0" max="100" value={form.values.progress} onChange={form.handleChange} onBlur={form.handleBlur} className={`field ${form.touched.progress && form.errors.progress ? "field-error" : ""}`} />
          <FieldError form={form} name="progress" />
        </div>
      </div>
      <div>
        <label className="label">Users *</label>
        <MultiSelectDropdown value={form.values.memberIds} onChange={(value) => form.setFieldValue("memberIds", value)} options={team.map((member) => ({ label: member.name, value: member.id, subtitle: member.role, avatar: member.avatar }))} error={Boolean(form.touched.memberIds && form.errors.memberIds)} />
        <FieldError form={form} name="memberIds" />
      </div>
      <div>
        <label className="label">Due date</label>
        <DatePickerField value={form.values.dueDate} onChange={(value) => form.setFieldValue("dueDate", value)} ariaLabel="Project due date" error={Boolean(form.touched.dueDate && form.errors.dueDate)} />
        <FieldError form={form} name="dueDate" />
      </div>
      <button disabled={form.isSubmitting} className="primary-btn mt-2 w-full disabled:cursor-not-allowed disabled:opacity-60">
        {form.isSubmitting ? "Please wait…" : editing ? "Save Project" : "Create Project"}
      </button>
    </form>
  );
}
