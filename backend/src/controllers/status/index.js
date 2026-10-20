const { updateStatusOrder, deleteStatus } = require("../../handler/status");

//hooks
const {
  DeleteStatusSchema,
  UpdateStatusSchema,
} = require("../../utils/validation/status");

const yup = require("yup");

exports.UpdateStatus = async function (req, res) {
  try {
    await UpdateStatusSchema.validate(req.body, { abortEarly: false });
    const response = await updateStatusOrder(req);
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

exports.DeleteStatus = async function (req, res) {
  try {
    await DeleteStatusSchema.validate(req.body, { abortEarly: false });
    const response = await deleteStatus(req);
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
