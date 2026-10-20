const { Commands, Task, User } = require("../../models");

exports.createCommand = async (req, res) => {
  try {
    const { task_id, command, created_by } = req.body;
    const [task, user] = await Promise.all([
      Task.findById(task_id),
      User.findById(created_by),
    ]);
    if (!task) {
      return {
        status: false,
        responseCode: 404,
        message: "Task not found",
      };
    }
    if (!user) {
      return {
        status: false,
        responseCode: 404,
        message: "User not found",
      };
    }
    await Commands.create({ task_id, command, created_by });
    return {
      status: true,
      responseCode: 201,
      message: "Command created successfully",
    };
  } catch (error) {
    return {
      status: false,
      responseCode: 500,
      message: "Failed to create command",
      db_error: error,
    };
  }
};

exports.getCommands = async (req, res) => {
  try {
    const { task_id } = req.params;
    const commands = await Commands.find({ task_id })
      .populate("created_by", "name")
      .sort({ createdAt: -1 });
    return {
      status: true,
      responseCode: 200,
      message: "Commands fetched successfully",
      commands,
    };
  } catch (error) {
    return {
      status: false,
      responseCode: 500,
      message: "Failed to fetch commands",
      db_error: error,
    };
  }
};
