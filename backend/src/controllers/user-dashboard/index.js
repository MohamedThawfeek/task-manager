const {
  dashboardUserTaskCount,
  dashboardUserProjects,
  dashboardRecentTasks,
  dashboardUpcomingTasks,
  dashboardBarChart,
  dashboardDonughtChart,
} = require("../../handler/dashboard");

exports.TaskCount = async function (req, res) {
  try {
    const response = await dashboardUserTaskCount(req);
    return res.status(response.responseCode).send(response);
  } catch (err) {
    return res.status(400).json({ message: err });
  }
};

exports.Projects = async function (req, res) {
  try {
    const response = await dashboardUserProjects(req);
    return res.status(response.responseCode).send(response);
  } catch (err) {
    return res.status(400).json({ message: err });
  }
};

exports.RecentTasks = async function (req, res) {
  try {
    const response = await dashboardRecentTasks(req);
    return res.status(response.responseCode).send(response);
  } catch (err) {
    return res.status(400).json({ message: err });
  }
};

exports.UpcomingTasks = async function (req, res) {
  try {
    const response = await dashboardUpcomingTasks(req);
    return res.status(response.responseCode).send(response);
  } catch (err) {
    return res.status(400).json({ message: err });
  }
};

exports.BarChart = async function (req, res) {
  try {
    const response = await dashboardBarChart(req);
    return res.status(response.responseCode).send(response);
  } catch (err) {
    return res.status(400).json({ message: err });
  }
};

exports.DonughtChart = async function (req, res) {
  try {
    const response = await dashboardDonughtChart(req);
    return res.status(response.responseCode).send(response);
  } catch (err) {
    return res.status(400).json({ message: err });
  }
};
