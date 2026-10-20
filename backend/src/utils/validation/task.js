const yup = require("yup");

exports.CreateTaskSchema = yup
  .object({
    project_id: yup.string().trim().required("Project ID is required."),
    status_id: yup.string().trim().required("Status ID is required."),
    title: yup.string().trim().required("Task title is required."),
    description: yup.string().trim(),
    priority: yup.string().trim().required("Priority is required."),
    due_date: yup.string().required("Due date is required."),
    assigned_to: yup
      .array()
      .of(yup.string().trim())
      .required("Assignee ID is required."),
    todos: yup
      .array()
      .of(
        yup.object({
          title: yup.string().trim().required("Todo title is required."),
          completed: yup.boolean().required("Completed is required."),
        }),
      )
      .required("Todos is required."),
    attachments: yup.array().of(yup.string().trim()).nullable(true),
  })
  .noUnknown(true, "Unknown field is not allowed.");

exports.EditTaskSchema = yup
  .object({
    task_id: yup.string().trim().required("Task ID is required."),
    title: yup.string().trim().required("Task title is required."),
    description: yup.string().trim(),
    priority: yup.string().trim().required("Priority is required."),
    due_date: yup.string().required("Due date is required."),
    assigned_to: yup.array().of().required("Assignee ID is required."),
    todos: yup.array().of().required("Todos is required."),
    attachments: yup.array().of(yup.string().trim()).nullable(true),
  })
  .noUnknown(true, "Unknown field is not allowed.");

exports.UpdateTodoStatusSchema = yup
  .object({
    task_id: yup.string().trim().required("Task ID is required."),
    todo_id: yup.string().trim().required("Todo ID is required."),
    completed: yup.boolean().required("Completed is required."),
  })
  .noUnknown(true, "Unknown field is not allowed.");

exports.DeleteTaskSchema = yup
  .object({
    task_id: yup.string().trim().required("Task ID is required."),
  })
  .noUnknown(true, "Unknown field is not allowed.");
