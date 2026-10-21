const yup = require("yup");

exports.ProjectCreateSchema = yup
  .object({
    name: yup.string().trim().required("Project name is required."),
    description: yup.string().trim(),
    status: yup
      .string()
      .oneOf(["active", "inactive", "hold", "completed"])
      .required("Project status is required."),
    progress: yup.number().min(0).max(100).required("Progress is required."),
    due_date: yup.string().trim().required("Due date is required."),
    users: yup
      .array()
      .of(yup.string().trim().required("User ID is required."))
      .min(1, "Select at least one user.")
      .required("Users are required."),
  })
  .noUnknown(true, "Unknown field is not allowed.");

exports.ProjectEditSchema = yup
  .object({
    project_id: yup.string().trim().required("Project ID is required."),
    name: yup.string().trim().required("Project name is required."),
    description: yup.string().trim(),
    status: yup
      .string()
      .oneOf(["active", "inactive", "hold", "completed"])
      .required("Project status is required."),
    progress: yup.number().min(0).max(100).required("Progress is required."),
    due_date: yup.string().trim().required("Due date is required."),
    users: yup
      .array()
      .of(yup.string().trim().required("User ID is required."))
      .min(1, "Select at least one user.")
      .required("Users are required."),
  })
  .noUnknown(true, "Unknown field is not allowed.");

exports.AddMemberSchema = yup
  .object({
    project_id: yup.string().trim().required("Project ID is required."),
    member_email: yup
      .string()
      .email()
      .trim()
      .required("Member email is required."),
    create: yup.boolean(),
    view: yup.boolean(),
    update: yup.boolean(),
    delete: yup.boolean(),
    edit: yup.boolean(),
    all: yup.boolean(),
  })
  .noUnknown(true, "Unknown field is not allowed.");

exports.DeleteProjectSchema = yup
  .object({
    project_id: yup.string().trim().required("Project ID is required."),
  })
  .noUnknown(true, "Unknown field is not allowed.");

exports.RemoveMemberSchema = yup
  .object({
    project_id: yup.string().trim().required("Project ID is required."),
    member_email: yup
      .string()
      .email()
      .trim()
      .required("Member email is required."),
  })
  .noUnknown(true, "Unknown field is not allowed.");

exports.UpdateMemberAccessSchema = yup
  .object({
    project_id: yup.string().trim().required("Project ID is required."),
    user_id: yup.string().trim().required("User ID is required."),
    create: yup.boolean(),
    view: yup.boolean(),
    update: yup.boolean(),
    delete: yup.boolean(),
    edit: yup.boolean(),
    all: yup.boolean(),
  })
  .noUnknown(true, "Unknown field is not allowed.");

exports.GetParticularProjectSchema = yup
  .object({
    project_id: yup.string().trim().required("Project ID is required."),
  })
  .noUnknown(true, "Unknown field is not allowed.");
