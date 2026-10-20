const router = require("express").Router();

const { UpdateStatus, DeleteStatus } = require("../controllers/status");

router.put("/update", UpdateStatus);
router.delete("/delete", DeleteStatus);

module.exports = router;
