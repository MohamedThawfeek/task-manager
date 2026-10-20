const yup = require("yup");

exports.UserRegisterSchema = yup
  .object({
    name: yup.string().trim().required("Name is required."),
    email: yup.string().email().trim().required("Email is required."),
    password: yup.string().trim().required("Password is required."),
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
