const {
  createTask,
  deleteTask,
  editTask,
  updateTodoStatus,
} = require("../../handler/tasks");

//hooks
const {
  CreateTaskSchema,
  DeleteTaskSchema,
  EditTaskSchema,
  UpdateTodoStatusSchema,
} = require("../../utils/validation/task");

const yup = require("yup");

exports.CreateTask = async function (req, res) {
  try {
    await CreateTaskSchema.validate(req.body, { abortEarly: false });
    const response = await createTask(req);
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

exports.EditTask = async function (req, res) {
  try {
    await EditTaskSchema.validate(req.body, { abortEarly: false });
    const response = await editTask(req);
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

exports.UpdateTodoStatus = async function (req, res) {
  try {
    await UpdateTodoStatusSchema.validate(req.body, { abortEarly: false });
    const response = await updateTodoStatus(req);
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

exports.DeleteTask = async function (req, res) {
  try {
    await DeleteTaskSchema.validate(req.body, { abortEarly: false });
    const response = await deleteTask(req);
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
