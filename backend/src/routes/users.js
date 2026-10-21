const router = require("express").Router();

const {
  UserRegister,
  Login,
  GetUserProfile,
  ForgotPassword,
  ResetPassword,
  UpdateUserProfile,
  DeleteUser,
  UpdatePassword,
  GetAllUsers,
  AdminDeleteUser,
  adminUpdateUser,
} = require("../controllers/users");
const { authMiddleware } = require("../middleware/auth");

router.post("/register", UserRegister);
router.post("/login", Login);
router.get("/profile", [authMiddleware], GetUserProfile);
router.post("/forgot-password", ForgotPassword);
router.put("/reset-password", ResetPassword);
router.patch("/update-profile", [authMiddleware], UpdateUserProfile);
router.delete("/delete", [authMiddleware], DeleteUser);
router.patch("/update-password", [authMiddleware], UpdatePassword);
router.get("/users", [authMiddleware], GetAllUsers);
router.delete("/admin-delete", [authMiddleware], AdminDeleteUser);
router.patch("/admin-update", [authMiddleware], adminUpdateUser);

module.exports = router;
