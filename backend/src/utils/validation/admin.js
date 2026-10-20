const yup = require("yup");

exports.AdminCreateSchema = yup
  .object({
    name: yup
      .string()
      .trim()
      .min(3, "Name must contain at least 3 characters.")
      .max(30, "Name cannot exceed 30 characters.")
      .required("Name is required."),
    email: yup
      .string()
      .trim()
      .email("Enter a valid email address.")
      .required("Email is required."),
    password: yup
      .string()
      .min(8, "Password must contain at least 8 characters.")
      .required("Password is required."),
  })
  .noUnknown(true, "Unknown field is not allowed.");

exports.AdminLoginSchema = yup
  .object({
    email: yup.string().trim().required("Email is required."),
    password: yup.string().required("Password is required."),
  })
  .noUnknown(true, "Unknown field is not allowed.");

exports.AdminForgotPasswordSchema = yup
  .object({
    email: yup.string().trim().required("Email is required."),
  })
  .noUnknown(true, "Unknown field is not allowed.");

exports.AdminResetPasswordSchema = yup
  .object({
    token: yup.string().required("Token is required."),
    password: yup
      .string()
      .min(8, "Password must contain at least 8 characters.")
      .required("Password is required."),
  })
  .noUnknown(true, "Unknown field is not allowed.");
