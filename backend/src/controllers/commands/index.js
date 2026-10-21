const { createCommand, getCommands } = require("../../handler/commands");

//hooks
const { CreateCommandSchema } = require("../../utils/validation/commands");

const yup = require("yup");

exports.CreateCommand = async function (req, res) {
  try {
    await CreateCommandSchema.validate(req.body, { abortEarly: false });
    const response = await createCommand(req);
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

exports.GetCommands = async function (req, res) {
  try {
    const response = await getCommands(req);
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
