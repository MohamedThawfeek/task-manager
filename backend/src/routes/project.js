const router = require("express").Router();

const {
  AddMember,
  CreateProject,
  DeleteProject,
  EditProject,
  GetAllProjects,
  RemoveMember,
  UpdateMemberAccess,
} = require("../controllers/project");

router.post("/create", CreateProject);
router.put("/update", EditProject);
router.get("/projects", GetAllProjects);
router.delete("/delete", DeleteProject);
router.put("/add-member", AddMember);
router.put("/remove-member", RemoveMember);
router.put("/update-member-access", UpdateMemberAccess);

module.exports = router;
