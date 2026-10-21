const { Task, Project, User, Status } = require("../../models");
const dayjs = require("dayjs");
const mongoose = require("mongoose");

exports.dashboardUserTaskCount = async (req, res) => {
  const { id } = req;

  try {
    const tasks = await Task.find({
      assigned_to: id,
    }).lean();

    const today = new Date().toISOString().split("T")[0];

    const totalTask = tasks.length;

    const completedTask = tasks.filter(
      (task) =>
        task.todos.length > 0 && task.todos.every((todo) => todo.completed),
    ).length;

    const inProgressTask = tasks.filter(
      (task) =>
        task.todos.some((todo) => todo.completed) &&
        task.todos.some((todo) => !todo.completed),
    ).length;

    const overdueTask = tasks.filter(
      (task) =>
        task.due_date &&
        task.due_date < today &&
        !(task.todos.length > 0 && task.todos.every((todo) => todo.completed)),
    ).length;

    const percentage = (count) =>
      totalTask > 0 ? Number(((count / totalTask) * 100).toFixed(2)) : 0;

    const response = {
      totalTask: {
        count: totalTask,
        percentage: 100,
      },
      completedTask: {
        count: completedTask,
        percentage: percentage(completedTask),
      },
      inProgressTask: {
        count: inProgressTask,
        percentage: percentage(inProgressTask),
      },
      overdueTask: {
        count: overdueTask,
        percentage: percentage(overdueTask),
      },
    };

    return {
      status: true,
      responseCode: 200,
      message: "Dashboard task count fetched successfully",
      data: response,
    };
  } catch (error) {
    return {
      status: false,
      responseCode: 500,
      message: "Failed to fetch dashboard task count",
      db_error: error.message,
    };
  }
};

exports.dashboardUserProjects = async (req) => {
  const { id } = req;

  try {
    // Get the latest projects assigned to the logged-in user.
    const projects = await Project.find({
      project_access: id,
    })
      .sort({ createdAt: -1 })
      .limit(3)
      .select("name status due_date project_access createdAt")
      .populate({
        path: "project_access",
        select: "name email",
        model: User,
      })
      .lean();

    const projectIds = projects.map((project) => project._id);

    // Load the project tasks once, then group their statistics by project.
    const tasks = await Task.find({
      project_id: { $in: projectIds },
    })
      .select("project_id todos")
      .lean();

    const taskStats = new Map();

    tasks.forEach((task) => {
      if (!task.project_id) return;

      const projectId = task.project_id.toString();
      const stats = taskStats.get(projectId) || {
        totalTasks: 0,
        completedTasks: 0,
      };
      const todos = Array.isArray(task.todos) ? task.todos : [];
      const isCompleted =
        todos.length > 0 && todos.every((todo) => todo.completed === true);

      stats.totalTasks += 1;
      if (isCompleted) stats.completedTasks += 1;
      taskStats.set(projectId, stats);
    });

    const response = projects.map((project) => {
      const projectId = project._id.toString();
      const members = Array.isArray(project.project_access)
        ? project.project_access.filter(Boolean)
        : [];
      const uniqueMembers = [
        ...new Map(members.map((user) => [user._id.toString(), user])).values(),
      ];
      const stats = taskStats.get(projectId) || {
        totalTasks: 0,
        completedTasks: 0,
      };
      const progress =
        stats.totalTasks > 0
          ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
          : 0;

      return {
        project_id: project._id,
        name: project.name,
        status: project.status,
        due_date: project.due_date ?? null,
        total_tasks: stats.totalTasks,
        total_members: uniqueMembers.length,
        members: uniqueMembers.map((user) => ({
          id: user._id,
          name: user.name,
          email: user.email,
        })),
        completed_tasks: stats.completedTasks,
        progress,
      };
    });

    return {
      status: true,
      responseCode: 200,
      message: "Dashboard projects fetched successfully",
      data: response,
    };
  } catch (error) {
    return {
      status: false,
      responseCode: 500,
      message: "Failed to fetch dashboard projects",
      db_error: error.message,
    };
  }
};

exports.dashboardRecentTasks = async (req, res) => {
  const { id } = req;

  try {
    // Fetch latest 5 tasks assigned to logged-in user
    const findTask = await Task.find({
      assigned_to: id,
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title assigned_to due_date status_id priority createdAt")
      .populate({
        path: "assigned_to",
        select: "name email",
        model: User,
      })
      .populate({
        path: "status_id",
        select: "status_type",
        model: Status,
      })
      .lean();

    // Format response for dashboard UI
    const response = findTask.map((task, index) => ({
      id: task._id,
      sno: index + 1,
      title: task.title,
      assigned_to: task.assigned_to.map((user) => ({
        id: user._id,
        name: user.name,
        email: user.email,
      })),
      status: task.status_id?.status_type || "To Do",
      priority: task.priority,
      due_date: task.due_date,
      created_at: task.createdAt,
    }));

    return {
      status: true,
      responseCode: 200,
      message: "Dashboard recent tasks fetched successfully",
      data: response,
    };
  } catch (error) {
    return {
      status: false,
      responseCode: 500,
      message: "Failed to fetch dashboard recent tasks",
      db_error: error.message,
    };
  }
};

exports.dashboardUpcomingTasks = async (req, res) => {
  const { id } = req;

  try {
    // Get tomorrow's date
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1);

    // Get date after 5 days
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 5);

    // Format YYYY-MM-DD
    const formatDate = (date) => date.toISOString().split("T")[0];

    const findTask = await Task.find({
      assigned_to: id,
      due_date: {
        $gte: formatDate(startDate),
        $lte: formatDate(endDate),
      },
      "todos.completed": { $ne: false },
    })
      .sort({ due_date: 1 })
      .limit(5)
      .select("title priority due_date")
      .lean();

    const response = findTask.map((task) => ({
      task_id: task._id,
      title: task.title,
      priority: task.priority,
      due_date: task.due_date,
    }));

    return {
      status: true,
      responseCode: 200,
      message: "Dashboard upcoming tasks fetched successfully",
      data: response,
    };
  } catch (error) {
    return {
      status: false,
      responseCode: 500,
      message: "Failed to fetch dashboard upcoming tasks",
      db_error: error.message,
    };
  }
};

exports.dashboardBarChart = async (req, res) => {
  const { id } = req;

  try {
    const today = dayjs();

    const startDate = today.startOf("month");
    const endDate = today.endOf("month");

    const userId = new mongoose.Types.ObjectId(id);

    // Get tasks assigned to logged-in user
    const tasks = await Task.find({
      assigned_to: userId,
      "todos.updated_by": userId,
      "todos.completed": true,
    })
      .select("todos")
      .lean();

    // Divide current month into 5 date ranges
    const daysInMonth = today.daysInMonth();

    const chartData = [];

    for (let i = 0; i < 5; i++) {
      const startDay = Math.floor((i * daysInMonth) / 5) + 1;

      const endDay = Math.floor(((i + 1) * daysInMonth) / 5);

      const rangeStart = startDate.date(startDay);
      const rangeEnd = startDate.date(endDay);

      let completedCount = 0;

      tasks.forEach((task) => {
        task.todos.forEach((todo) => {
          if (
            todo.completed === true &&
            todo.updated_by?.toString() === id.toString() &&
            todo.updated_time
          ) {
            const completedDate = dayjs(todo.updated_time);

            if (
              completedDate.isValid() &&
              !completedDate.isBefore(rangeStart, "day") &&
              !completedDate.isAfter(rangeEnd, "day")
            ) {
              completedCount++;
            }
          }
        });
      });

      chartData.push({
        date: rangeEnd.format("MMM D"),
        start_date: rangeStart.format("YYYY-MM-DD"),
        end_date: rangeEnd.format("YYYY-MM-DD"),
        completed: completedCount,
      });
    }

    return {
      status: true,
      responseCode: 200,
      message: "Dashboard task completion trend fetched successfully",
      data: chartData,
    };
  } catch (error) {
    return {
      status: false,
      responseCode: 500,
      message: "Failed to fetch dashboard task completion trend",
      db_error: error.message,
    };
  }
};

exports.dashboardDonughtChart = async (req, res) => {
  const { id } = req;

  try {
    const startDate = dayjs().startOf("month").toDate();
    const endDate = dayjs().add(1, "month").startOf("month").toDate();

    const tasks = await Task.find({
      assigned_to: id,
      createdAt: {
        $gte: startDate,
        $lt: endDate,
      },
    })
      .select("status_id")
      .populate({
        path: "status_id",
        select: "status_type",
        model: Status,
      })
      .lean();

    const statusCount = {
      Done: 0,
      "In Progress": 0,
      Review: 0,
      "To Do": 0,
    };

    tasks.forEach((task) => {
      const status = task.status_id?.status_type;

      if (Object.hasOwn(statusCount, status)) {
        statusCount[status]++;
      }
    });

    const totalTasks = Object.values(statusCount).reduce(
      (sum, count) => sum + count,
      0,
    );

    const colors = {
      Done: "#76B041",
      "In Progress": "#3483FA",
      Review: "#FFB627",
      "To Do": "#A83CC4",
    };

    const response = Object.entries(statusCount).map(([name, value]) => ({
      name,
      value,
      percentage: totalTasks
        ? Number(((value / totalTasks) * 100).toFixed(2))
        : 0,
      color: colors[name],
    }));

    return {
      status: true,
      responseCode: 200,
      message: "Dashboard task status chart fetched successfully",
      total_tasks: totalTasks,
      data: response,
    };
  } catch (error) {
    return {
      status: false,
      responseCode: 500,
      message: "Failed to fetch dashboard task status chart",
      db_error: error.message,
    };
  }
};
