import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { selectLoader, setLoader } from "../../redux/slice/initialLoader";
import { selectTeamRows, setTeamRows } from "../../redux/slice/team";
import {
  deleteProject as removeProjectFromStore,
  setProjectDetails,
  setProjectError,
  setProjects,
  updateProject as updateProjectInStore,
} from "../../redux/slice/workspace";
import {
  createProject,
  deleteProject,
  getProject,
  getProjects,
  updateProject,
} from "../../service/project";
import { getUsers } from "../../service/user";

function mergeMembers(team, projectMembers = []) {
  const members = new Map(team.map((member) => [member.id, member]));
  projectMembers.forEach((member) =>
    members.set(member.id, { ...members.get(member.id), ...member }),
  );
  return [...members.values()];
}

export function useProjectsPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { projects, tasks, projectError } = useAppSelector(
    (state) => state.workspace,
  );
  const access = useAppSelector((state) => state.auth.user?.access || "User");
  const team = useAppSelector(selectTeamRows);
  const isLoading = useAppSelector(selectLoader("projectList"));
  const isSubmitting = useAppSelector(selectLoader("projectSubmit"));
  const isDeleting = useAppSelector(selectLoader("projectDelete"));
  const [filter, setFilter] = useState("All Projects");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const list = projects.filter(
    (project) => filter === "All Projects" || project.status === filter,
  );

  const loadProjects = useCallback(async () => {
    dispatch(setLoader({ key: "projectList", value: true }));
    dispatch(setProjectError(""));
    try {
      const rows = await getProjects(access);
      dispatch(setProjects(rows));
      return rows;
    } catch (error) {
      dispatch(setProjectError(error.message || "Unable to load projects"));
      throw error;
    } finally {
      dispatch(setLoader({ key: "projectList", value: false }));
    }
  }, [access, dispatch]);

  const loadTeam = useCallback(async () => {
    try {
      const users = await getUsers();
      dispatch(setTeamRows(users));
    } catch {
      // The project list remains usable if the optional user request fails.
    }
  }, [dispatch]);

  useEffect(() => {
    loadProjects().catch(() => undefined);
    loadTeam();
  }, [loadProjects, loadTeam]);

  const openCreate = () => {
    setEditing(null);
    setModal(true);
  };
  const openEdit = (project) => {
    setEditing(project);
    setModal(true);
  };
  const closeModal = () => {
    setModal(false);
    setEditing(null);
  };
  const saveProject = async (data) => {
    dispatch(setLoader({ key: "projectSubmit", value: true }));
    dispatch(setProjectError(""));
    try {
      const result = editing
        ? await updateProject({ ...editing, ...data })
        : await createProject(data);
      await loadProjects();
      toast.success(
        result.message || (editing ? "Project updated" : "Project created"),
      );
      closeModal();
    } catch (error) {
      dispatch(setProjectError(error.message || "Unable to save project"));
      toast.error(error.message || "Unable to save project");
    } finally {
      dispatch(setLoader({ key: "projectSubmit", value: false }));
    }
  };
  const confirmDelete = async () => {
    if (!deleting) return;
    dispatch(setLoader({ key: "projectDelete", value: true }));
    dispatch(setProjectError(""));
    try {
      const result = await deleteProject(deleting.id);
      dispatch(removeProjectFromStore(deleting.id));
      toast.success(result.message || "Project deleted");
    } catch (error) {
      dispatch(setProjectError(error.message || "Unable to delete project"));
      toast.error(error.message || "Unable to delete project");
    } finally {
      dispatch(setLoader({ key: "projectDelete", value: false }));
    }
  };

  return {
    projects,
    tasks,
    team,
    list,
    filter,
    setFilter,
    modal,
    editing,
    deleting,
    setDeleting,
    navigate,
    openCreate,
    openEdit,
    closeModal,
    saveProject,
    confirmDelete,
    loadProjects,
    error: projectError,
    isLoading,
    isSubmitting,
    isDeleting,
  };
}

export function useProjectDetailsPage() {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { projects, tasks, projectError } = useAppSelector(
    (state) => state.workspace,
  );
  const storedTeam = useAppSelector(selectTeamRows);
  const isLoading = useAppSelector(selectLoader("projectDetail"));
  const isSubmitting = useAppSelector(selectLoader("projectSubmit"));
  const isDeleting = useAppSelector(selectLoader("projectDelete"));
  const project = projects.find((item) => item.id === id);
  const team = useMemo(
    () => mergeMembers(storedTeam, project?.members),
    [storedTeam, project?.members],
  );
  const [tab, setTab] = useState("Tasks");
  const [edit, setEdit] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [memberId, setMemberId] = useState("");
  const projectTasks = useMemo(
    () => tasks.filter((task) => task.projectId === id),
    [tasks, id],
  );

  const loadProject = useCallback(async () => {
    dispatch(setLoader({ key: "projectDetail", value: true }));
    dispatch(setProjectError(""));
    try {
      const details = await getProject(id);
      dispatch(setProjectDetails(details));
      return details;
    } catch (error) {
      dispatch(setProjectError(error.message || "Unable to load project"));
      throw error;
    } finally {
      dispatch(setLoader({ key: "projectDetail", value: false }));
    }
  }, [dispatch, id]);

  useEffect(() => {
    loadProject().catch(() => undefined);
    getUsers()
      .then((users) => dispatch(setTeamRows(users)))
      .catch(() => undefined);
  }, [dispatch, loadProject]);

  const saveProject = async (data) => {
    if (!project) return;
    dispatch(setLoader({ key: "projectSubmit", value: true }));
    try {
      const result = await updateProject({ ...project, ...data });
      dispatch(updateProjectInStore({ ...project, ...data }));
      await loadProject();
      setEdit(false);
      toast.success(result.message || "Project updated");
    } catch (error) {
      toast.error(error.message || "Unable to update project");
    } finally {
      dispatch(setLoader({ key: "projectSubmit", value: false }));
    }
  };
  const assignMember = async () => {
    if (!memberId || !project || project.memberIds.includes(memberId)) return;
    await saveProject({
      ...project,
      memberIds: [...project.memberIds, memberId],
    });
    setMemberId("");
  };
  const removeMember = async (idToRemove) => {
    if (!project) return;
    await saveProject({
      ...project,
      memberIds: project.memberIds.filter((item) => item !== idToRemove),
    });
  };
  const removeProject = async () => {
    if (!project) return;
    dispatch(setLoader({ key: "projectDelete", value: true }));
    try {
      const result = await deleteProject(project.id);
      dispatch(removeProjectFromStore(project.id));
      toast.success(result.message || "Project deleted");
      navigate("/projects");
    } catch (error) {
      toast.error(error.message || "Unable to delete project");
    } finally {
      dispatch(setLoader({ key: "projectDelete", value: false }));
    }
  };

  return {
    id,
    navigate,
    project,
    team,
    projectTasks,
    tab,
    setTab,
    edit,
    setEdit,
    confirm,
    setConfirm,
    memberId,
    setMemberId,
    saveProject,
    assignMember,
    removeMember,
    removeProject,
    loadProject,
    error: projectError,
    isLoading,
    isSubmitting,
    isDeleting,
  };
}
