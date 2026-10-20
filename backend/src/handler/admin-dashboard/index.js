const { Task, Project, User, Status, Access } = require("../../models");
const dayjs = require("dayjs");
const mongoose = require("mongoose");

exports.dashboardAdminTaskCount = async (req, res) => {
  try {
    const tasks = await Task.find({}).lean();

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

exports.dashbaordAdminProjects = async (req, res) => {
  try {
    // 1. Get latest 3 projects
    const projects = await Project.find({})
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();

    const projectIds = projects.map((project) => project._id);

    // 2. Get members and tasks
    const [findUsers, tasks] = await Promise.all([
      Access.find({
        project_id: { $in: projectIds },
      })
        .populate({
          path: "user_id",
          select: "name email",
          model: User,
        })
        .lean(),

      Task.find({
        project_id: { $in: projectIds },
      })
        .select("project_id todos")
        .lean(),
    ]);

    // 3. Generate response
    const response = projects.map((project) => {
      const projectId = project._id.toString();

      // Find project members
      const members = findUsers
        .filter((access) => access.project_id?.toString() === projectId)
        .map((access) => access.user_id)
        .filter(Boolean);

      // Remove duplicate members
      const uniqueMembers = [
        ...new Map(members.map((user) => [user._id.toString(), user])).values(),
      ];

      // Find project tasks
      const projectTasks = tasks.filter(
        (task) => task.project_id?.toString() === projectId,
      );

      const totalTasks = projectTasks.length;

      // Count completed tasks
      const completedTasks = projectTasks.filter(
        (task) =>
          task.todos?.length > 0 &&
          task.todos.every((todo) => todo.completed === true),
      ).length;

      // Calculate progress
      const progress =
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      return {
        project_id: project._id,
        name: project.name,
        status: project.status,
        due_date: project.due_date ?? null,
        total_tasks: totalTasks,
        total_members: uniqueMembers.length,
        members: uniqueMembers.map((user) => ({
          id: user._id,
          name: user.name,
          email: user.email,
        })),
        completed_tasks: completedTasks,
        progress,
      };
    });

    return {
      status: true,
      responseCode: 200,
      message: "Admin dashboard projects fetched successfully",
      data: response,
    };
  } catch (error) {
    return {
      status: false,
      responseCode: 500,
      message: "Failed to fetch admin dashboard projects",
      db_error: error.message,
    };
  }
};

exports.dashboardRecentTasks = async (req, res) => {
  try {
    // Fetch latest 5 tasks assigned to logged-in user
    const findTask = await Task.find()
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
  try {
    const today = dayjs();

    const startDate = today.startOf("month");

    // Get all tasks containing completed todos
    const tasks = await Task.find({
      "todos.completed": true,
    })
      .select("todos")
      .lean();

    // Divide current month into 5 ranges
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
          if (todo.completed === true && todo.updated_time) {
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
      message: "Admin dashboard task completion trend fetched successfully",
      data: chartData,
    };
  } catch (error) {
    return {
      status: false,
      responseCode: 500,
      message: "Failed to fetch admin dashboard task completion trend",
      db_error: error.message,
    };
  }
};

exports.dashboardDonughtChart = async (req, res) => {
  try {
    const startDate = dayjs().startOf("month").toDate();
    const endDate = dayjs().add(1, "month").startOf("month").toDate();

    const tasks = await Task.find({
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
