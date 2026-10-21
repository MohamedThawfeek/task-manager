import { FormikProvider } from "formik";
import useFormikForm from "../formik/useFormikForm";
import {
  FormikDatePicker,
  FormikDropdown,
  FormikError,
  FormikInput,
  FormikMultiSelect,
  FormikTextarea,
} from "../formik/FormikFields";
import { projectSchema } from "../../validations/forms";

export default function ProjectForm({ initial, onSubmit, team = [] }) {
  const formik = useFormikForm({
    initialValues: {
      name: "",
      description: "",
      status: "Active",
      progress: 0,
      memberIds: [],
      dueDate: "",
      ...initial,
    },
    validationSchema: projectSchema,
    enableReinitialize: true,
    onSubmit,
  });

  return (
    <FormikProvider value={formik}>
      <form onSubmit={formik.handleSubmit} className="space-y-4" noValidate>
        <div>
          <label className="label">Project name</label>
          <FormikInput name="name" />
          <FormikError name="name" />
        </div>
        <div>
          <label className="label">Description</label>
          <FormikTextarea name="description" className="min-h-25" />
          <FormikError name="description" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Status</label>
            <FormikDropdown
              name="status"
              options={["Active", "Completed", "Inactive", "Hold"]}
            />
            <FormikError name="status" />
          </div>
          <div>
            <label className="label">Progress</label>
            <FormikInput name="progress" type="number" min="0" max="100" />
            <FormikError name="progress" />
          </div>
        </div>
        <div>
          <label className="label">Users *</label>
          <FormikMultiSelect
            name="memberIds"
            options={team.map((member) => ({
              label: member.name,
              value: member.id,
              subtitle: member.role,
              avatar: member.avatar,
            }))}
          />
          <FormikError name="memberIds" />
        </div>
        <div>
          <label className="label">Due date</label>
          <FormikDatePicker name="dueDate" ariaLabel="Project due date" />
          <FormikError name="dueDate" />
        </div>
        <button
          disabled={formik.isSubmitting}
          className="primary-btn mt-2 w-full disabled:cursor-not-allowed disabled:opacity-60"
        >
          {formik.isSubmitting
            ? "Please wait…"
            : initial
              ? "Save Project"
              : "Create Project"}
        </button>
      </form>
    </FormikProvider>
  );
}
