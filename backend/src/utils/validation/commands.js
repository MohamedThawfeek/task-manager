const yup = require("yup");

exports.CreateCommandSchema = yup
  .object({
    task_id: yup.string().trim().required("Task ID is required."),
    command: yup.string().trim().required("Command is required."),
  })
  .noUnknown(true, "Unknown field is not allowed.");
