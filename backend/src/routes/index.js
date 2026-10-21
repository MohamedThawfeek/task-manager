const router = require("express").Router();

const users = require("./users");
const project = require("./project");
const status = require("./status");
const task = require("./task");
const notification = require("./notification");
const comment = require("./commands");
const adminDashboard = require("./admin-dashboard");
const userDashboard = require("./user-dashboard");

router.use("/v1/users", users);
router.use("/v1/project", project);
router.use("/v1/status", status);
router.use("/v1/task", task);
router.use("/v1/notification", notification);
router.use("/v1/comment", comment);
router.use("/v1/admindashboard", adminDashboard);
router.use("/v1/userdashboard", userDashboard);

module.exports = router;
