const router = require("express").Router();

const {
  TaskCount,
  Projects,
  RecentTasks,
  UpcomingTasks,
  BarChart,
  DonughtChart,
} = require("../controllers/admin-dashboard");

const { authMiddleware } = require("../middleware/auth");

router.get("/task-count", authMiddleware, TaskCount);
router.get("/projects", authMiddleware, Projects);
router.get("/recent-tasks", authMiddleware, RecentTasks);
router.get("/upcoming-tasks", authMiddleware, UpcomingTasks);
router.get("/bar-chart", authMiddleware, BarChart);
router.get("/donught-chart", authMiddleware, DonughtChart);

module.exports = router;
