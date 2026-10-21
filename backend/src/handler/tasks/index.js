const {
  Project,
  Status,
  Task,
  User,
  Commands,
  Notification,
} = require("../../models");
const dayjs = require("dayjs");
const { fileToBase64 } = require("../../utils/image");

const uploadedFilesToBase64 = async (files) => {
  if (!files) return [];
  const list = Array.isArray(files) ? files : [files];
  return Promise.all(list.map((file) => fileToBase64(file)));
};

const normalizeTodos = (todos, userId) =>
  (todos || []).map((todo) => ({
    title: typeof todo === "string" ? todo : todo.title,
    completed: typeof todo === "object" ? Boolean(todo.completed) : false,
    created_by: typeof todo === "object" ? todo.created_by || userId : userId,
  }));

exports.createTask = async (req, res) => {
  const { id } = req;

  const {
    title,
    project_id,
    status_id,
    description,
    priority,
    due_date,
    assigned_to = [],
    todos = [],
  } = req.body;

  try {
    // Get multiple attachments
    const files = req.files?.attachments;
    const uploadedAttachments = await uploadedFilesToBase64(files);
    const attachments = [
      ...(Array.isArray(req.body.attachments) ? req.body.attachments : []),
      ...uploadedAttachments,
    ];
    // 2. Find project
    const findProject = await Project.findById(project_id);

    if (!findProject) {
      return {
        status: false,
        responseCode: 404,
        message: "Project not found",
      };
    }

    // 3. Find project status
    const findStatus = await Status.findOne({
      _id: status_id,
      project_id,
    });

    if (!findStatus) {
      return {
        status: false,
        responseCode: 404,
        message: "Project status not found",
      };
    }

    // 14. Create task
    const task = await Task.create({
      project_id,
      title,
      description,
      priority,
      due_date,
      assigned_to,
      todos: normalizeTodos(todos, id),
      attachments,
      status_id,
      created_by: id,
      updated_by: id,
    });

    await Promise.all(
      assigned_to.map(async (user_id) => {
        await Notification.create({
          project: findProject.name,
          name: `${title}`,
          description: `${description}`,
          user_id: user_id,
        });
      }),
    );

    return {
      status: true,
      responseCode: 201,
      message: "Task created successfully",
      task,
    };
  } catch (error) {
    console.error("Create Task Error:", error);

    return {
      status: false,
      responseCode: 500,
      message: "Failed to create task",
    };
  }
};

exports.editTask = async (req, res) => {
  const { id } = req;
  const {
    task_id,
    assigned_to = [],
    todos = [],
    title,
    description,
    priority,
    due_date,
    status_id,
    project_id,
  } = req.body;

  try {
    // Get multiple attachments
    const files = req.files?.attachments;
    const uploadedAttachments = await uploadedFilesToBase64(files);
    const retainedAttachments = Array.isArray(req.body.attachments)
      ? req.body.attachments
      : [];

    const findProject = await Project.findById(project_id);

    if (!findProject) {
      return {
        status: false,
        responseCode: 404,
        message: "Project not found",
      };
    }

    // 1. Find task
    const findTask = await Task.findById(task_id);

    if (!findTask) {
      return {
        status: false,
        responseCode: 404,
        message: "Task not found",
      };
    }

    // 15. Prepare update payload
    const updatePayload = {
      assigned_to: assigned_to,
      updated_by: id,
      title,
      description,
      priority,
      due_date,
      status_id,
      project_id,
    };

    if (req.body.attachments !== undefined || uploadedAttachments.length) {
      updatePayload.attachments = [
        ...retainedAttachments,
        ...uploadedAttachments,
      ];
    }

    // 16. Update todos only if provided
    if (todos !== undefined) {
      updatePayload.todos = normalizeTodos(todos, id);
    }

    // 17. Update task
    const updatedTask = await Task.findByIdAndUpdate(
      task_id,
      { $set: updatePayload },
      { new: true, runValidators: true },
    );

    const newAssignedUsers = assigned_to.filter(
      (user_id) => !findTask.assigned_to.includes(user_id),
    );

    console.log(newAssignedUsers);
    await Promise.all(
      newAssignedUsers.map(async (user_id) => {
        await Notification.create({
          project: findProject.name,
          name: `${title}`,
          description: `${description}`,
          user_id: user_id,
        });
      }),
    );

    return {
      status: true,
      responseCode: 200,
      message: "Task updated successfully",
      task: updatedTask,
    };
  } catch (error) {
    console.error("Edit Task Error:", error);

    return {
      status: false,
      responseCode: 500,
      message: "Failed to update task",
    };
  }
};

// exports.updateTodoStatus = async (req, res) => {
//   try {
//     const { id } = req;
//     const { task_id, todo_id, completed } = req.body;

//     // 1. Find task and update specific todo
//     const task = await Task.findOneAndUpdate(
//       {
//         _id: task_id,
//         "todos._id": todo_id,
//       },
//       {
//         $set: {
//           "todos.$.completed": completed,
//           updated_by: id,
//         },
//       },
//       {
//         new: true,
//         runValidators: true,
//       },
//     );

//     // 2. Check task
//     if (!task) {
//       return {
//         status: false,
//         responseCode: 404,
//         message: "Task or Todo not found",
//       };
//     }
//     const updateProject = await Project.findOneAndUpdate(
//       { _id: task.project_id },
//       { $set: { progress: task.progress + 1 } },
//       { new: true, runValidators: true },
//     );

//     // 3. Success response
//     return {
//       status: true,
//       responseCode: 200,
//       message: "Todo status updated successfully",
//     };
//   } catch (error) {
//     console.error("Update Todo Status Error:", error);

//     return {
//       status: false,
//       responseCode: 500,
//       message: "Failed to update todo status",
//     };
//   }
// };

exports.updateTodoStatus = async (req, res) => {
  const { id } = req;
  const { task_id, todo_id, completed } = req.body;

  try {
    // Check the task and todo independently from access permissions. Keeping
    // `assigned_to` in this query caused admins/creators to receive a false 404.
    const existingTask = await Task.findOne({
      _id: task_id,
      "todos._id": todo_id,
    }).select("assigned_to created_by project_id");

    if (!existingTask) {
      return {
        status: false,
        responseCode: 404,
        message: "Task or Todo not found",
      };
    }

    const requestingUser = await User.findById(id).select("access").lean();
    const isAdmin = requestingUser?.access === "Admin";
    const isCreator = existingTask.created_by?.equals(id);
    const isAssignee = existingTask.assigned_to.some((userId) =>
      userId.equals(id),
    );

    if (!isAdmin && !isCreator && !isAssignee) {
      return {
        status: false,
        responseCode: 403,
        message: "You do not have permission to update this todo",
      };
    }

    // Update the matched todo atomically after access has been verified.
    const task = await Task.findOneAndUpdate(
      {
        _id: task_id,
        "todos._id": todo_id,
      },
      {
        $set: {
          "todos.$.completed": completed,
          "todos.$.updated_by": id,
          "todos.$.updated_time": dayjs().toISOString(),
        },
        $addToSet: {
          updated_by: id,
        },
      },
      {
        new: true,
        runValidators: true,
      },
    );

    // The todo may have been removed between the read and update operations.
    if (!task) {
      return {
        status: false,
        responseCode: 404,
        message: "Task or Todo not found",
      };
    }

    // 3. Find all tasks belonging to the project
    const projectTasks = await Task.find({
      project_id: task.project_id,
    })
      .select("todos")
      .lean();

    // 4. Total project tasks
    const totalTasks = projectTasks.length;

    // 5. Count completed tasks
    const completedTasks = projectTasks.filter(
      (task) =>
        task.todos?.length > 0 &&
        task.todos.every((todo) => todo.completed === true),
    ).length;

    // 6. Calculate project progress percentage
    const progress =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // 7. Update project progress
    const updateProject = await Project.findByIdAndUpdate(
      task.project_id,
      {
        $set: {
          progress: progress,
        },
      },
      {
        new: true,
        runValidators: true,
      },
    );

    await Notification.create({
      project: updateProject.name,
      name: `${task.title}`,
      description: `${task.description}`,
      user_id: updateProject.created_by,
      message: `Task ${task.title} is ${completed ? "completed" : "not completed"}`,
    });

    // 8. Success response
    return {
      status: true,
      responseCode: 200,
      message: "Todo status and project progress updated successfully",
    };
  } catch (error) {
    console.error("Update Todo Status Error:", error);

    return {
      status: false,
      responseCode: 500,
      message: "Failed to update todo status",
      db_error: error.message,
    };
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const { task_id } = req.body;

    // 1. Find and delete task
    const task = await Task.findByIdAndDelete(task_id);

    // 2. Check task
    if (!task) {
      return {
        status: false,
        responseCode: 404,
        message: "Task not found",
      };
    }

    // 3. Success response
    return {
      status: true,
      responseCode: 200,
      message: "Task deleted successfully",
    };
  } catch (error) {
    console.error("Delete Task Error:", error);

    return {
      status: false,
      responseCode: 500,
      message: "Failed to delete task",
    };
  }
};

exports.getTasks = async (req, res) => {
  const { id } = req;
  const { project_id, priority } = req.query;

  try {
    // 1. Build filter
    const filter = {
      assigned_to: id,
      ...(project_id ? { project_id } : {}),
      ...(priority ? { priority } : {}),
    };

    // 2. Fetch tasks
    const findTask = await Task.find(filter)
      .sort({ createdAt: -1 })
      .populate([
        {
          path: "project_id",
          select: "_id name",
          model: Project,
        },
        {
          path: "status_id",
          select: "_id status_type color",
          model: Status,
        },
        {
          path: "assigned_to",
          select: "_id name email",
          model: User,
        },
      ])
      .lean();

    // 3. Initialize Kanban columns
    const groupedTasks = {
      "To Do": [],
      "In Progress": [],
      Review: [],
      Done: [],
    };

    // 4. Group tasks by status
    findTask.forEach((task) => {
      const rawStatus = task.status_id?.status_type || "To Do";
      const status = rawStatus === "To DO" ? "To Do" : rawStatus;

      if (!Object.hasOwn(groupedTasks, status)) {
        return;
      }

      groupedTasks[status].push({
        task_id: task._id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        due_date: task.due_date,
        todos: task.todos || [],
        attachments: task.attachments || [],

        project: task.project_id
          ? {
              project_id: task.project_id._id,
              name: task.project_id.name,
            }
          : null,

        status: {
          status_id: task.status_id?._id || null,
          status_type: status,
          color: task.status_id?.color || null,
        },

        assigned_to: (task.assigned_to || []).filter(Boolean).map((user) => ({
          user_id: user._id,
          name: user.name,
          email: user.email,
        })),
      });
    });

    // 5. Format response
    const response = Object.entries(groupedTasks).map(([status, tasks]) => ({
      status,
      count: tasks.length,
      tasks,
    }));

    return {
      status: true,
      responseCode: 200,
      message: "Tasks fetched successfully",
      total_tasks: response.reduce((total, item) => total + item.count, 0),
      data: response,
    };
  } catch (error) {
    return {
      status: false,
      responseCode: 500,
      message: "Failed to fetch tasks",
      db_error: error.message,
    };
  }
};

exports.getAllTasks = async (req, res) => {
  const { project_id, priority } = req.query;

  try {
    // 1. Build filter
    const filter = {
      ...(project_id ? { project_id } : {}),
      ...(priority ? { priority } : {}),
    };

    // 2. Fetch tasks
    const findTask = await Task.find(filter)
      .sort({ createdAt: -1 })
      .populate([
        {
          path: "project_id",
          select: "_id name",
          model: Project,
        },
        {
          path: "status_id",
          select: "_id status_type color",
          model: Status,
        },
        {
          path: "assigned_to",
          select: "_id name email",
          model: User,
        },
      ])
      .lean();

    // 3. Initialize Kanban columns
    const groupedTasks = {
      "To Do": [],
      "In Progress": [],
      Review: [],
      Done: [],
    };

    // 4. Group tasks by status
    findTask.forEach((task) => {
      const rawStatus = task.status_id?.status_type || "To Do";
      const status = rawStatus === "To DO" ? "To Do" : rawStatus;

      if (!Object.hasOwn(groupedTasks, status)) {
        return;
      }

      groupedTasks[status].push({
        task_id: task._id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        due_date: task.due_date,
        todos: task.todos || [],
        attachments: task.attachments || [],

        project: task.project_id
          ? {
              project_id: task.project_id._id,
              name: task.project_id.name,
            }
          : null,

        status: {
          status_id: task.status_id?._id || null,
          status_type: status,
          color: task.status_id?.color || null,
        },

        assigned_to: (task.assigned_to || []).filter(Boolean).map((user) => ({
          user_id: user._id,
          name: user.name,
          email: user.email,
        })),
      });
    });

    // 5. Format response
    const response = Object.entries(groupedTasks).map(([status, tasks]) => ({
      status,
      count: tasks.length,
      tasks,
    }));

    return {
      status: true,
      responseCode: 200,
      message: "Tasks fetched successfully",
      total_tasks: response.reduce((total, item) => total + item.count, 0),
      data: response,
    };
  } catch (error) {
    return {
      status: false,
      responseCode: 500,
      message: "Failed to fetch tasks",
      db_error: error.message,
    };
  }
};

exports.getParticulartask = async (req, res) => {
  try {
    const { task_id } = req.body;

    const findTask = await Task.findById(task_id)
      .populate([
        {
          path: "project_id",
          select: "_id name",
          model: Project,
        },
        {
          path: "status_id",
          select: "_id status_type color",
          model: Status,
        },
        {
          path: "assigned_to",
          select: "_id name",
          model: User,
        },
      ])
      .lean();

    if (!findTask) {
      return {
        status: false,
        responseCode: 404,
        message: "Task not found",
      };
    }

    const findCommand = await Commands.find({
      task_id: task_id,
    })
      .sort({ createdAt: -1 })
      .populate([
        {
          path: "created_by",
          select: "_id name",
          model: User,
        },
      ]);

    const response = {
      task_id: findTask._id,
      title: findTask.title,
      status: {
        status_id: findTask.status_id?._id || null,
        status_type:
          findTask.status_id?.status_type === "To DO"
            ? "To Do"
            : findTask.status_id?.status_type || "To Do",
        color: findTask.status_id?.color || null,
      },
      priority: findTask.priority,
      due_date: findTask.due_date,
      description: findTask.description,
      assigned_to: findTask.assigned_to,
      attachments: findTask.attachments,
      project: findTask.project_id
        ? {
            project_id: findTask.project_id._id,
            name: findTask.project_id.name,
          }
        : null,
      todos: findTask.todos,
    };

    const comments = findCommand.map((command) => {
      return {
        command: command.command,
        created_by: command.created_by.name,
        created_at: command.createdAt,
      };
    });

    return {
      status: true,
      responseCode: 200,
      message: "Task fetched successfully",
      data: {
        task: response,
        comments,
      },
    };
  } catch (error) {
    return {
      status: false,
      responseCode: 500,
      message: "Failed to fetch task",
      db_error: error.message,
    };
  }
};

exports.userProfileTasks = async (req, res) => {
  const { id } = req;
  try {
    const findTask = await Task.find({ assigned_to: id })
      .populate([
        {
          path: "status_id",
          select: "_id status_type color",
          model: Status,
        },
      ])
      .lean();

    const response = findTask.map((task) => {
      return {
        task_id: task._id,
        title: task.title,
        priority: task.priority,
        due_date: task.due_date,
        status: task.status_id.status_type,
      };
    });

    return {
      status: true,
      responseCode: 200,
      message: "Tasks fetched successfully",
      data: response,
    };
  } catch (error) {
    return {
      status: false,
      responseCode: 500,
      message: "Failed to fetch tasks",
      db_error: error.message,
    };
  }
};

exports.userActivity = async (req, res) => {
  const { id } = req;

  try {
    // 1. Find tasks assigned to logged-in user
    const tasks = await Task.find({
      assigned_to: id,
      "todos.updated_by": { $ne: null },
      "todos.updated_time": { $exists: true, $ne: null },
    })
      .select("title todos")
      .populate({
        path: "todos.updated_by",
        select: "name email",
        model: User,
      })
      .lean();

    // 2. Collect todo activities
    const activities = [];

    tasks.forEach((task) => {
      (task.todos || []).forEach((todo) => {
        if (!todo.updated_by || !todo.updated_time) return;

        const updatedDate = new Date(todo.updated_time);

        if (Number.isNaN(updatedDate.getTime())) return;

        activities.push({
          task_id: task._id,
          todo_id: todo._id,
          title: task.title,

          user: {
            user_id: todo.updated_by._id,
            name: todo.updated_by.name,
            email: todo.updated_by.email,
          },

          completed: todo.completed,

          message: `${todo.updated_by.name} is working on ${task.title}`,

          updated_at: updatedDate,
        });
      });
    });

    // 3. Sort latest activities first
    activities.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

    // 4. Get latest 5 activities
    const response = activities.slice(0, 5);

    return {
      status: true,
      responseCode: 200,
      message: "Recent activities fetched successfully",
      data: response,
    };
  } catch (error) {
    return {
      status: false,
      responseCode: 500,
      message: "Failed to fetch recent activities",
      db_error: error.message,
    };
  }
};

exports.userTasksCalander = async (req, res) => {
  const { id } = req;
  const { type } = req.query;

  try {
    const findUser = await User.findById(id);

    if (!findUser) {
      return {
        status: false,
        responseCode: 404,
        message: "User not found",
      };
    }
    let startDate;
    let endDate;

    // 1. Check week or month
    if (type === "week") {
      startDate = dayjs().format("YYYY-MM-DD");

      endDate = dayjs().add(7, "day").format("YYYY-MM-DD");
    } else if (type === "month") {
      startDate = dayjs().startOf("month").format("YYYY-MM-DD");

      endDate = dayjs().endOf("month").format("YYYY-MM-DD");
    } else {
      return {
        status: false,
        responseCode: 400,
        message: "Invalid type. Use week or month",
      };
    }

    const isAdmin = findUser.access !== "Admin";

    // 2. Fetch tasks
    const findTask = await Task.find({
      ...(isAdmin && { assigned_to: id }),
      due_date: {
        $gte: startDate,
        $lte: endDate,
      },
    })
      .select("title due_date priority status_id")
      .sort({ due_date: 1 })
      .lean();

    // 3. Format response
    const response = findTask.map((task) => ({
      task_id: task._id,
      title: task.title,
      due_date: task.due_date,
      priority: task.priority,
      status_id: task.status_id,
    }));

    return {
      status: true,
      responseCode: 200,
      message: "Calendar tasks fetched successfully",
      filter: type,
      start_date: startDate,
      end_date: endDate,
      total_tasks: response.length,
      data: response,
    };
  } catch (error) {
    return {
      status: false,
      responseCode: 500,
      message: "Failed to fetch calendar tasks",
      db_error: error.message,
    };
  }
};

exports.taskStatusUpdate = async (req, res) => {
  const { id } = req;
  const { task_id, status_id } = req.body;

  try {
    // 1. Find task
    const findTask = await Task.findById(task_id);

    if (!findTask) {
      return {
        status: false,
        responseCode: 404,
        message: "Task not found",
      };
    }

    const findStatus = await Status.findOne({
      _id: status_id,
      project_id: findTask.project_id,
    });

    if (!findStatus) {
      return {
        status: false,
        responseCode: 404,
        message: "Project status not found",
      };
    }

    await Task.findByIdAndUpdate(task_id, {
      $set: { status_id },
      $addToSet: { updated_by: id },
    });

    return {
      status: true,
      responseCode: 200,
      message: "Task status updated successfully",
    };
  } catch (error) {
    return {
      status: false,
      responseCode: 500,
      message: "Failed to update task status",
      db_error: error.message,
    };
  }
};
