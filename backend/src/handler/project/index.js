const { Project, Status, User, Task, Notification } = require("../../models");
const emailQueue = require("../../utils/queue");

exports.createProject = async (req, res) => {
  try {
    const { id } = req;
    const { name, description, status, progress, due_date, users } = req.body;

    // 2. Find user
    const findUser = await User.findById(id);

    if (!findUser) {
      return {
        status: false,
        responseCode: 404,
        message: "User not found",
      };
    }

    // 3. Create project
    const project = await Project.create({
      name,
      description,
      created_by: id,
      updated_by: id,
      status,
      progress,
      due_date,
      project_access: [...users],
    });

    const board_status = [
      { status_type: "To Do", color: "#FFFFFF" },
      { status_type: "In Progress", color: "#EAF3FF" },
      { status_type: "Review", color: "#FEF6E4" },
      { status_type: "Done", color: "#EAF8F2" },
    ];

    // 5. Create board statuses
    const statuses = await Status.insertMany(
      board_status.map((item) => ({
        project_id: project._id,
        status_type: item.status_type,
        color: item.color || "#ffffff",
        created_by: id,
      })),
    );

    // 6. Update project
    await Project.findByIdAndUpdate(
      project._id,
      {
        board_status: statuses.map((item) => item._id),
      },
      { new: true },
    );

    await Promise.all(
      users.map(async (user_id) => {
        await Notification.create({
          project: name,
          name: `You are added to project`,
          description: ``,
          user_id: user_id,
          message: `Project ${name} has been created`,
        });
      }),
    );

    // 7. Return response
    return {
      status: true,
      responseCode: 201,
      message: "Project created successfully",
    };
  } catch (error) {
    console.error("Create Project Error:", error);

    return {
      status: false,
      responseCode: 500,
      message: "Failed to create project",
    };
  }
};

exports.editProject = async (req, res) => {
  try {
    const { id } = req;
    const { project_id, name, description, status, progress, due_date, users } =
      req.body;

    // 2. Find project
    const project = await Project.findById(project_id);

    if (!project) {
      return {
        status: false,
        responseCode: 404,
        message: "Project not found",
      };
    }

    await Project.findByIdAndUpdate(project_id, {
      name,
      description,
      status,
      progress,
      due_date,
      updated_by: id,
      project_access: [...users],
    });

    const newAddedUsers = users.filter(
      (user_id) => !project.project_access.includes(user_id),
    );

    await Promise.all(
      newAddedUsers.map(async (user_id) => {
        await Notification.create({
          project: name,
          name: `You are added to project`,
          description: ``,
          user_id: user_id,
          message: `Project ${name} has been updated`,
        });
      }),
    );

    return {
      status: true,
      responseCode: 200,
      message: "Project updated successfully",
    };
  } catch (error) {
    console.error("Edit Project Error:", error);

    return {
      status: false,
      responseCode: 500,
      message: "Failed to edit project",
    };
  }
};

exports.getAllProjects = async (req, res) => {
  try {
    const { id } = req;

    const findUser = await User.findById(id);

    if (!findUser) {
      return {
        status: false,
        responseCode: 404,
        message: "User not found",
      };
    }

    if (findUser.access !== "Admin") {
      return {
        status: false,
        responseCode: 403,
        message: "Admin access is required",
      };
    }

    const projects = await Project.find()
      .populate({
        path: "project_access",
        select: "_id name role profile",
        model: User,
      })
      .sort({ createdAt: -1 })
      .lean();
    const projectIds = projects.map((project) => project._id);
    const taskCounts = await Task.aggregate([
      { $match: { project_id: { $in: projectIds } } },
      { $group: { _id: "$project_id", count: { $sum: 1 } } },
    ]);
    const countByProject = new Map(
      taskCounts.map((item) => [String(item._id), item.count]),
    );

    return {
      status: true,
      responseCode: 200,
      message: "Projects fetched successfully",
      projects: projects.map((project) => ({
        ...project,
        task_count: countByProject.get(String(project._id)) || 0,
      })),
    };
  } catch (error) {
    console.error("Get All Projects Error:", error);

    return {
      status: false,
      responseCode: 500,
      message: "Failed to get all projects",
    };
  }
};

exports.getProjects = async (req, res) => {
  try {
    const { id } = req;

    const findUser = await User.findById(id);

    if (!findUser) {
      return {
        status: false,
        responseCode: 404,
        message: "User not found",
      };
    }

    const projects = await Project.find({ project_access: id })
      .populate({
        path: "project_access",
        select: "_id name role profile",
        model: User,
      })
      .sort({ createdAt: -1 })
      .lean();
    const projectIds = projects.map((project) => project._id);
    const taskCounts = await Task.aggregate([
      { $match: { project_id: { $in: projectIds } } },
      { $group: { _id: "$project_id", count: { $sum: 1 } } },
    ]);
    const countByProject = new Map(
      taskCounts.map((item) => [String(item._id), item.count]),
    );

    return {
      status: true,
      responseCode: 200,
      message: "Projects fetched successfully",
      projects: projects.map((project) => ({
        ...project,
        task_count: countByProject.get(String(project._id)) || 0,
      })),
    };
  } catch (error) {
    console.error("Get All Projects Error:", error);

    return {
      status: false,
      responseCode: 500,
      message: "Failed to get all projects",
    };
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const { project_id } = req.body;

    // 2. Find project
    const project = await Project.findById(project_id);

    if (!project) {
      return {
        status: false,
        responseCode: 404,
        message: "Project not found",
      };
    }

    await Status.deleteMany({ project_id });
    await Task.deleteMany({ project_id });
    await Project.findByIdAndDelete(project_id);

    return {
      status: true,
      responseCode: 200,
      message: "Project deleted successfully",
    };
  } catch (error) {
    console.error("Delete Project Error:", error);

    return {
      status: false,
      responseCode: 500,
      message: "Failed to delete project",
    };
  }
};

exports.getParticularProject = async (req, res) => {
  try {
    const { project_id } = req.body;

    // 2. Find project
    const project = await Project.findById(project_id).populate([
      {
        path: "project_access",
        select: "_id name role",
        model: User,
      },
      {
        path: "board_status",
        select: "_id status_type color",
        model: Status,
      },
    ]);

    if (!project) {
      return {
        status: false,
        responseCode: 404,
        message: "Project not found",
      };
    }

    const requestingUser = await User.findById(req.id).select("access").lean();
    const hasProjectAccess = project.project_access.some(
      (user) => user && String(user._id) === String(req.id),
    );
    if (requestingUser?.access !== "Admin" && !hasProjectAccess) {
      return {
        status: false,
        responseCode: 403,
        message: "You do not have access to this project",
      };
    }

    const findTask = await Task.find({
      project_id,
    }).populate([
      {
        path: "status_id",
        select: "_id status_type color",
        model: Status,
      },
    ]);

    const response = {
      overview: {
        id: project._id,
        due_date: project.due_date,
        progress: project.progress,
        status: project.status,
        description: project.description,
        name: project.name,
        created_at: project.createdAt,
        board_status: project.board_status,
      },
      tasks: findTask.map((task) => ({
        task_id: task._id,
        title: task.title,
        assigned_to: task.assigned_to,
        status:
          task.status_id?.status_type === "To DO"
            ? "To Do"
            : task.status_id?.status_type || "To Do",
        priority: task.priority,
        due_date: task.due_date,
        attachments: task.attachments,
      })),
      teams: project.project_access.filter(Boolean).map((user) => ({
        id: user._id,
        name: user.name,
        role: user.role,
      })),
    };

    return {
      status: true,
      responseCode: 200,
      message: "Project fetched successfully",
      data: response,
    };
  } catch (error) {
    console.error("Get Particular Project Error:", error);

    return {
      status: false,
      responseCode: 500,
      message: "Failed to get particular project",
    };
  }
};
