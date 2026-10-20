const router = require("express").Router();

const admin = require("./admin");
const users = require("./users");
const project = require("./project");
const status = require("./status");
const task = require("./task");

router.use("/v1/admin", admin);
router.use("/v1/users", users);
router.use("/v1/project", project);
router.use("/v1/status", status);
router.use("/v1/task", task);

module.exports = router;
