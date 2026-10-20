const { Project, Access, Status, User, Task } = require("../../models");
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
      { status_type: "To DO", color: "#FFFFFF" },
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
    const updatedProject = await Project.findByIdAndUpdate(
      project._id,
      {
        board_status: statuses.map((item) => item._id),
      },
      { new: true },
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

    const projects = await Project.find();

    return {
      status: true,
      responseCode: 200,
      message: "Projects fetched successfully",
      projects,
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

    const projects = await Project.find({
      project_access: id,
    });

    return {
      status: true,
      responseCode: 200,
      message: "Projects fetched successfully",
      projects,
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
    const project = await Project.findById(project_id).populate({
      path: "project_access",
      select: "_id name role",
      model: User,
    });

    if (!project) {
      return {
        status: false,
        responseCode: 404,
        message: "Project not found",
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
        due_date: project.due_date,
        progress: project.progress,
        status: project.status,
        description: project.description,
        name: project.name,
      },
      tasks: findTask.map((task) => ({
        task_id: task._id,
        title: task.title,
        assigned_to: task.assigned_to,
        status: task.status_id.status_type,
        priority: task.priority,
        due_date: task.due_date,
      })),
      teams: project.project_access.map((user) => ({
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
