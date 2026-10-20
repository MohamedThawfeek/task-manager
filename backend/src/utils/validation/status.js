const yup = require("yup");

exports.UpdateStatusSchema = yup
  .object({
    status_id: yup.string().trim().required("Status ID is required."),
    status_type: yup.string().trim().required("Status type is required."),
    color: yup.string().trim().required("Color is required."),
  })
  .noUnknown(true, "Unknown field is not allowed.");

exports.DeleteStatusSchema = yup
  .object({
    status_id: yup.string().trim().required("Status ID is required."),
  })
  .noUnknown(true, "Unknown field is not allowed.");
