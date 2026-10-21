const router = require("express").Router();

const {
  CreateTask,
  EditTask,
  UpdateTodoStatus,
  DeleteTask,
  GetAllTasks,
  GetTasks,
  ParticularTask,
  UserActivity,
  UserProfileTasks,
  UserTasksCalander,
  TaskStatusUpdate,
} = require("../controllers/tasks");

const { authMiddleware } = require("../middleware/auth");

const parseJsonArrayFields = (req, res, next) => {
  try {
    ["assigned_to", "todos", "attachments"].forEach((field) => {
      if (typeof req.body?.[field] === "string") {
        req.body[field] = JSON.parse(req.body[field]);
      }
    });
    next();
  } catch {
    return res.status(400).json({
      status: false,
      message: "Invalid task array data.",
    });
  }
};

router.post("/create", [authMiddleware, parseJsonArrayFields], CreateTask);
router.put("/update", [authMiddleware, parseJsonArrayFields], EditTask);
router.put("/update-status", [authMiddleware], UpdateTodoStatus);
router.delete("/delete", [authMiddleware], DeleteTask);
router.get("/admin-tasks", [authMiddleware], GetAllTasks);
router.get("/user-tasks", [authMiddleware], GetTasks);
router.post("/particular-task", [authMiddleware], ParticularTask);
router.get("/user-activity", [authMiddleware], UserActivity);
router.get("/user-profile-tasks", [authMiddleware], UserProfileTasks);
router.get("/user-tasks-calander", [authMiddleware], UserTasksCalander);
router.put("/task-status-update", [authMiddleware], TaskStatusUpdate);

module.exports = router;
