const { Commands, Task, User, Notification } = require("../../models");

exports.createCommand = async (req, res) => {
  const { id } = req;
  const { task_id, command } = req.body;
  try {
    const [task, user] = await Promise.all([
      Task.findById(task_id).populate("project_id", "name"),
      User.findById(id),
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
    await Commands.create({ task_id, command, created_by: id });

    await Promise.all(
      task.assigned_to.map(async (user_id) => {
        await Notification.create({
          project: task.project_id.name,
          name: `New Comment`,
          description: `New comment added to task ${task.name}`,
          user_id: user_id,
          message: `New comment added to task ${task.name} by ${user.name}`,
        });
      }),
    );

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
  const { task_id } = req.query;
  try {
    if (!task_id) {
      return {
        status: false,
        responseCode: 400,
        message: "Task ID is required",
      };
    }
    const commands = await Commands.find({ task_id })
      .populate("created_by", "name")
      .sort({ createdAt: -1 })
      .lean();
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
