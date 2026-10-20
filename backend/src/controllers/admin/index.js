const {
  adminLogin,
  adminRegister,
  forgotPassword,
  getAdminProfile,
} = require("../../handler/admin");

//hooks
const {
  AdminCreateSchema,
  AdminLoginSchema,
  AdminForgotPasswordSchema,
  AdminResetPasswordSchema,
} = require("../../utils/validation/admin");

const yup = require("yup");

exports.Register = async function (req, res) {
  try {
    await AdminCreateSchema.validate(req.body, { abortEarly: false });
    const response = await adminRegister(req);
    return res.status(response.responseCode).send(response);
  } catch (err) {
    if (err instanceof yup.ValidationError) {
      const errorMessages = err.inner.reduce((acc, currentError) => {
        acc[currentError.path] = currentError.message;
        return acc;
      }, {});
      return res.status(400).json({ message: errorMessages });
    }
  }
};

exports.Login = async function (req, res) {
  try {
    await AdminLoginSchema.validate(req.body, { abortEarly: false });
    const response = await adminLogin(req);
    return res.status(response.responseCode).send(response);
  } catch (err) {
    if (err instanceof yup.ValidationError) {
      const errorMessages = err.inner.reduce((acc, currentError) => {
        acc[currentError.path] = currentError.message;
        return acc;
      }, {});
      return res.status(400).json({ message: errorMessages });
    }
  }
};

exports.ForgotPassword = async function (req, res) {
  try {
    await AdminForgotPasswordSchema.validate(req.body, { abortEarly: false });
    const response = await forgotPassword(req);
    return res.status(response.responseCode).send(response);
  } catch (err) {
    if (err instanceof yup.ValidationError) {
      const errorMessages = err.inner.reduce((acc, currentError) => {
        acc[currentError.path] = currentError.message;
        return acc;
      }, {});
      return res.status(400).json({ message: errorMessages });
    }
  }
};

exports.ResetPassword = async function (req, res) {
  try {
    await AdminResetPasswordSchema.validate(req.body, { abortEarly: false });
    const response = await resetPassword(req);
    return res.status(response.responseCode).send(response);
  } catch (err) {
    if (err instanceof yup.ValidationError) {
      const errorMessages = err.inner.reduce((acc, currentError) => {
        acc[currentError.path] = currentError.message;
        return acc;
      }, {});
      return res.status(400).json({ message: errorMessages });
    }
  }
};

exports.GetProfile = async function (req, res) {
  try {
    const response = await getAdminProfile(req);
    return res.status(response.responseCode).send(response);
  } catch (err) {
    return res.status(400).json({ message: err });
  }
};
