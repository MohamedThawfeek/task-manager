const router = require("express").Router();
const { CreateCommand, GetCommands } = require("../controllers/commands");

const { authMiddleware } = require("../middleware/auth");

router.post("/create-command", authMiddleware, CreateCommand);
router.get("/get-commands", authMiddleware, GetCommands);

module.exports = router;
