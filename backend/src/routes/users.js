const router = require("express").Router();

const {
  UserRegister,
  Login,
  GetUserProfile,
  ForgotPassword,
  ResetPassword,
  UpdateUserProfile,
  DeleteUser,
} = require("../controllers/users");

router.post("/register", UserRegister);
router.post("/login", Login);
router.get("/profile", GetUserProfile);
router.post("/forgot-password", ForgotPassword);
router.put("/reset-password", ResetPassword);
router.patch("/update-profile", UpdateUserProfile);
router.delete("/delete", DeleteUser);

module.exports = router;
