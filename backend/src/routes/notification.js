const router = require("express").Router();
const {
  GetNotifications,
  UpdateNotification,
} = require("../controllers/notification");
const { authMiddleware } = require("../middleware/auth");

router.get("/notifications", [authMiddleware], GetNotifications);
router.patch("/update", [authMiddleware], UpdateNotification);

module.exports = router;
