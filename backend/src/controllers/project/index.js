const {
  createProject,
  editProject,
  addMember,
  deleteProject,
  getAllProjects,
  removeMember,
  updateMemberAccess,
} = require("../../handler/project");

//hooks
const {
  ProjectCreateSchema,
  AddMemberSchema,
  DeleteProjectSchema,
  ProjectEditSchema,
  RemoveMemberSchema,
  UpdateMemberAccessSchema,
} = require("../../utils/validation/project");

const yup = require("yup");

exports.CreateProject = async function (req, res) {
  try {
    await ProjectCreateSchema.validate(req.body, { abortEarly: false });
    const response = await createProject(req);
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

exports.EditProject = async function (req, res) {
  try {
    await ProjectEditSchema.validate(req.body, { abortEarly: false });
    const response = await editProject(req);
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

exports.GetAllProjects = async function (req, res) {
  try {
    const response = await getAllProjects(req);
    return res.status(response.responseCode).send(response);
  } catch (err) {
    return res.status(400).json({ message: err });
  }
};

exports.DeleteProject = async function (req, res) {
  try {
    await DeleteProjectSchema.validate(req.body, { abortEarly: false });
    const response = await deleteProject(req);
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

exports.AddMember = async function (req, res) {
  try {
    await AddMemberSchema.validate(req.body, { abortEarly: false });
    const response = await addMember(req);
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

exports.RemoveMember = async function (req, res) {
  try {
    await RemoveMemberSchema.validate(req.body, { abortEarly: false });
    const response = await removeMember(req);
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

exports.UpdateMemberAccess = async function (req, res) {
  try {
    await UpdateMemberAccessSchema.validate(req.body, { abortEarly: false });
    const response = await updateMemberAccess(req);
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
