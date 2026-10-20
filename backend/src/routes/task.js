const router = require("express").Router();

const {
  CreateTask,
  EditTask,
  UpdateTodoStatus,
  DeleteTask,
} = require("../controllers/tasks");

router.post("/create", CreateTask);
router.put("/update", EditTask);
router.put("/update-status", UpdateTodoStatus);
router.delete("/delete", DeleteTask);

module.exports = router;
