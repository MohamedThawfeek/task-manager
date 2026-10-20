const {
  userRegister,
  Login,
  forgotPassword,
  resetPassword,
  updateUserProfile,
  getUserProfile,
  deleteUser,
} = require("../../handler/users");

//hooks
const {
  UserRegisterSchema,
  LoginSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  UpdateProfileSchema,
} = require("../../utils/validation/users");

const yup = require("yup");

exports.UserRegister = async function (req, res) {
  try {
    await UserRegisterSchema.validate(req.body, { abortEarly: false });
    const response = await userRegister(req);
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
    await LoginSchema.validate(req.body, { abortEarly: false });
    const response = await Login(req);
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
    await ForgotPasswordSchema.validate(req.body, { abortEarly: false });
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
    await ResetPasswordSchema.validate(req.body, { abortEarly: false });
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

exports.UpdateUserProfile = async function (req, res) {
  try {
    await UpdateProfileSchema.validate(req.body, { abortEarly: false });
    const response = await updateUserProfile(req);
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

exports.GetUserProfile = async function (req, res) {
  try {
    const response = await getUserProfile(req);
    return res.status(response.responseCode).send(response);
  } catch (err) {
    return res.status(400).json({ message: err });
  }
};

exports.DeleteUser = async function (req, res) {
  try {
    const response = await deleteUser(req);
    return res.status(response.responseCode).send(response);
  } catch (err) {
    return res.status(400).json({ message: err });
  }
};
