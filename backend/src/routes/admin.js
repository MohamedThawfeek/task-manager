const router = require("express").Router();

const {
  Register,
  Login,
  GetProfile,
  ForgotPassword,
  ResetPassword,
} = require("../controllers/admin");

router.post("/register", Register);
router.post("/login", Login);
router.get("/profile", GetProfile);
router.post("/forgot-password", ForgotPassword);
router.put("/reset-password", ResetPassword);

module.exports = router;
