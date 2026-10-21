const yup = require("yup");

exports.UserRegisterSchema = yup
  .object({
    name: yup.string().trim().required("Name is required."),
    email: yup.string().email().trim().required("Email is required."),
    password: yup.string().trim().min(6, "Password must be at least 6 characters.").required("Password is required."),
    phone: yup.string().trim().required("Phone is required."),
    role: yup.string().trim().required("Role is required."),
    access: yup.string().oneOf(["User", "Admin"]).required("Access is required."),
    status: yup.string().oneOf(["Active", "Inactive"]).required("Status is required."),
  })
  .noUnknown(true, "Unknown field is not allowed.");

exports.LoginSchema = yup
  .object({
    email: yup.string().email().trim().required("Email is required."),
    password: yup.string().trim().required("Password is required."),
  })
  .noUnknown(true, "Unknown field is not allowed.");

exports.UpdateProfileSchema = yup
  .object({
    name: yup.string().trim().required("Name is required."),
    password: yup.string().trim().required("Password is required."),
  })
  .noUnknown(true, "Unknown field is not allowed.");

exports.ForgotPasswordSchema = yup
  .object({
    email: yup.string().email().trim().required("Email is required."),
  })
  .noUnknown(true, "Unknown field is not allowed.");

exports.ResetPasswordSchema = yup
  .object({
    token: yup.string().required("Token is required."),
    password: yup.string().trim().required("Password is required."),
  })
  .noUnknown(true, "Unknown field is not allowed.");

exports.UpdatePasswordSchema = yup
  .object({
    password: yup.string().trim().required("Password is required."),
  })
  .noUnknown(true, "Unknown field is not allowed.");

exports.AdminDeleteUserSchema = yup
  .object({
    id: yup.string().trim().required("User ID is required."),
  })
  .noUnknown(true, "Unknown field is not allowed.");

exports.AdminUpdateUserSchema = yup
  .object({
    id: yup.string().trim().required("User ID is required."),
    name: yup.string().trim().required("Name is required."),
    email: yup.string().email().trim().required("Email is required."),
    password: yup.string().trim().min(6, "Password must be at least 6 characters.").optional(),
    phone: yup.string().trim().required("Phone is required."),
    role: yup.string().trim().required("Role is required."),
    access: yup.string().oneOf(["User", "Admin"]).required("Access is required."),
    status: yup.string().oneOf(["Active", "Inactive"]).required("Status is required."),
  })
  .noUnknown(true, "Unknown field is not allowed.");
