const { Project, Status, Task, User, Commands } = require("../../models");
const dayjs = require("dayjs");

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
    attachments = [],
  } = req.body;

  try {
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
      todos: todos.map((todo) => ({
        title: todo,
        completed: false,
      })),
      attachments,
      status_id,
      created_by: id,
      updated_by: id,
    });

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
    attachments = [],
    title,
    description,
    priority,
    due_date,
    status_id,
    project_id,
  } = req.body;

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

    // 15. Prepare update payload
    const updatePayload = {
      assigned_to: assigned_to,
      updated_by: id,
      title,
      description,
      priority,
      due_date,
      attachments,
      status_id,
      project_id,
    };

    // 16. Update todos only if provided
    if (todos !== undefined) {
      updatePayload.todos = todos.map((todo) => ({
        title: todo,
        completed: false,
        created_by: id,
      }));
    }

    // 17. Update task
    const updatedTask = await Task.findByIdAndUpdate(
      task_id,
      { $set: updatePayload },
      { new: true, runValidators: true },
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
    // 1. Validate completed value
    if (typeof completed !== "boolean") {
      return {
        status: false,
        responseCode: 400,
        message: "Completed must be true or false",
      };
    }

    // 2. Update specific todo
    const task = await Task.findOneAndUpdate(
      {
        _id: task_id,
        "todos._id": todo_id,
        assigned_to: id,
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
    await Project.findByIdAndUpdate(
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

    // 8. Success response
    return {
      status: true,
      responseCode: 200,
      message: "Todo status and project progress updated successfully",
      // data: {
      //   task_id: task._id,
      //   todo_id,
      //   completed,
      //   project_id: task.project_id,
      //   total_tasks: totalTasks,
      //   completed_tasks: completedTasks,
      //   progress,
      // },
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
      const status = task.status_id?.status_type || "To Do";

      if (!Object.hasOwn(groupedTasks, status)) {
        return;
      }

      groupedTasks[status].push({
        task_id: task._id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        due_date: task.due_date,

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
      const status = task.status_id?.status_type || "To Do";

      if (!Object.hasOwn(groupedTasks, status)) {
        return;
      }

      groupedTasks[status].push({
        task_id: task._id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        due_date: task.due_date,

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
      title: findTask.title,
      status: findTask.status_id.status_type,
      priority: findTask.priority,
      due_date: findTask.due_date,
      description: findTask.description,
      assigned_to: findTask.assigned_to,
      attachments: findTask.attachments,
      project: findTask.project_id.name,
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

exports.userWiseTasks = async (req, res) => {
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
