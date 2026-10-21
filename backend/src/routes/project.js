const router = require("express").Router();

const {
  AddMember,
  CreateProject,
  DeleteProject,
  EditProject,
  GetAllProjects,
  RemoveMember,
  UpdateMemberAccess,
  GetParticularProject,
  GetProjects,
} = require("../controllers/project");
const { authMiddleware } = require("../middleware/auth");

router.use(authMiddleware);

router.post("/create", CreateProject);
router.put("/update", EditProject);
router.get("/projects", GetAllProjects);
router.delete("/delete", DeleteProject);
router.put("/add-member", AddMember);
router.put("/remove-member", RemoveMember);
router.put("/update-member-access", UpdateMemberAccess);
router.post("/project", GetParticularProject);
router.get("/user-projects", GetProjects);

module.exports = router;
