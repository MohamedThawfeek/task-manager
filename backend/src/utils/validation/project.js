const yup = require("yup");

exports.ProjectCreateSchema = yup
  .object({
    name: yup.string().trim().required("Project name is required."),
    description: yup.string().trim(),
    board_status: yup
      .array()
      .of(
        yup.object({
          status_type: yup.string().trim().required("Status type is required."),
          color: yup.string().trim().required("Color is required."),
        }),
      )
      .required("Board status is required."),
  })
  .noUnknown(true, "Unknown field is not allowed.");

exports.ProjectEditSchema = yup
  .object({
    project_id: yup.string().trim().required("Project ID is required."),
    name: yup.string().trim().required("Project name is required."),
    description: yup.string().trim(),
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
