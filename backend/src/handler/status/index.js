const { Project, Status, Task } = require("../../models");

exports.updateStatusOrder = async (req, res) => {
  const { id } = req;
  const { status_id, status_type, color } = req.body;
  try {
    const findStatus = await Status.findById(status_id);
    if (!findStatus) {
      return {
        status: false,
        responseCode: 404,
        message: "Status not found",
      };
    }
    await Status.findByIdAndUpdate(status_id, {
      status_type,
      color,
    });

    await Project.findByIdAndUpdate(findStatus.project_id, {
      updated_by: id,
    });

    return {
      status: true,
      responseCode: 200,
      message: "Status updated successfully",
    };
  } catch (error) {
    console.log(error);
    return {
      status: false,
      responseCode: 500,
      message: "Failed to update status",
    };
  }
};

exports.deleteStatus = async (req, res) => {
  const { id } = req;
  const { status_id } = req.body;
  try {
    const findStatus = await Status.findById(status_id);
    if (!findStatus) {
      return {
        status: false,
        responseCode: 404,
        message: "Status not found",
      };
    }
    await Status.findByIdAndDelete(status_id);
    await Task.deleteMany({ project_id: findStatus.project_id, status_id });
    await Project.findByIdAndUpdate(findStatus.project_id, {
      $pull: { board_status: status_id },
      updated_by: id,
    });

    return {
      status: true,
      responseCode: 200,
      message: "Status deleted successfully",
    };
  } catch (error) {
    console.log(error);
    return {
      status: false,
      responseCode: 500,
      message: "Failed to delete status",
    };
  }
};
