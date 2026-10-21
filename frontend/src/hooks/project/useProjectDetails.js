import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Formhandel from "../../components/formik/FormikFields";
import { projectSchema } from "../../validations/forms";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { selectTeamRows, setTeamRows } from "../../redux/slice/team";
import {
  deleteProject as removeProjectFromStore,
  setProjectDeleting,
  setProjectDetailLoading,
  setProjectDetails,
  setProjectError,
  setProjectSubmitting,
  updateProject as updateProjectInStore,
} from "../../redux/slice/project";
import { removeProjectTasks, selectTasks, setProjectTasks } from "../../redux/slice/task";
import api from "../../service/axios";
import { apiPath } from "../../service/path";
import {
  formatProject,
  formatProjectTask,
  formatUser,
  makeProjectBody,
} from "../../utils/apiData";

function mergeMembers(team, projectMembers = []) {
  const members = new Map(team.map((member) => [member.id, member]));
  projectMembers.forEach((member) => members.set(member.id, { ...members.get(member.id), ...member }));
  return [...members.values()];
}

export default function useProjectDetails() {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const projectState = useAppSelector((state) => state.project);
  const tasks = useAppSelector(selectTasks);
  const storedTeam = useAppSelector(selectTeamRows);
  const project = projectState.items.find((item) => item.id === id);
  const team = useMemo(() => mergeMembers(storedTeam, project?.members), [storedTeam, project?.members]);
  const projectTasks = useMemo(() => tasks.filter((task) => task.projectId === id), [tasks, id]);
  const [tab, setTab] = useState("Tasks");
  const [edit, setEdit] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [memberId, setMemberId] = useState("");

  const loadProject = useCallback(async () => {
    dispatch(setProjectDetailLoading(true));
    dispatch(setProjectError(""));
    try {
      const response = await api.post(
        apiPath.project,
        { project_id: id },
        "Unable to load project",
      );
      const data = response.data || {};
      const members = (Array.isArray(data.teams) ? data.teams : [])
        .map(formatUser);
      const projectTasks = Array.isArray(data.tasks) ? data.tasks : [];
      const details = {
        project: formatProject({
          ...(data.overview || {}),
          _id: data.overview?.id || id,
          project_access: members,
        }),
        tasks: projectTasks.map((task) => formatProjectTask(task, id)),
        members,
        files: projectTasks.flatMap((task) => task.attachments || []),
      };
      dispatch(setProjectDetails(details.project));
      dispatch(setProjectTasks({ projectId: id, tasks: details.tasks }));
      return details;
    } catch (error) {
      dispatch(setProjectError(error.message || "Unable to load project"));
      throw error;
    } finally {
      dispatch(setProjectDetailLoading(false));
    }
  }, [dispatch, id]);

  useEffect(() => {
    loadProject().catch(() => undefined);

    const loadUsers = async () => {
      const response = await api.get(apiPath.users, "Unable to load users");
      const users = (Array.isArray(response.users) ? response.users : [])
        .map(formatUser);
      dispatch(setTeamRows(users));
    };

    loadUsers().catch(() => undefined);
  }, [dispatch, loadProject]);

  const saveProject = async (values) => {
    if (!project) return;
    dispatch(setProjectSubmitting(true));
    try {
      const nextProject = { ...project, ...values };
      const result = await api.put(
        apiPath.updateProject,
        makeProjectBody(nextProject, true),
        "Unable to update project",
      );
      dispatch(updateProjectInStore(nextProject));
      await loadProject();
      setEdit(false);
      toast.success(result.message || "Project updated");
    } catch (error) {
      toast.error(error.message || "Unable to update project");
    } finally {
      dispatch(setProjectSubmitting(false));
    }
  };

  const projectForm = Formhandel({
    initialValue: {
      name: project?.name || "",
      description: project?.description || "",
      status: project?.status || "Active",
      progress: project?.progress || 0,
      memberIds: project?.memberIds || [],
      dueDate: project?.dueDate || "",
    },
    schema: projectSchema,
    submitFunction: saveProject,
    enableReinitialize: true,
  });

  const assignMember = async () => {
    if (!memberId || !project || project.memberIds.includes(memberId)) return;
    await saveProject({ ...project, memberIds: [...project.memberIds, memberId] });
    setMemberId("");
  };

  const removeMember = async (idToRemove) => {
    if (!project) return;
    await saveProject({ ...project, memberIds: project.memberIds.filter((item) => item !== idToRemove) });
  };

  const removeProject = async () => {
    if (!project) return;
    dispatch(setProjectDeleting(true));
    try {
      const result = await api.delete(
        apiPath.deleteProject,
        { project_id: project.id },
        "Unable to delete project",
      );
      dispatch(removeProjectFromStore(project.id));
      dispatch(removeProjectTasks(project.id));
      toast.success(result.message || "Project deleted");
      navigate("/projects");
    } catch (error) {
      toast.error(error.message || "Unable to delete project");
    } finally {
      dispatch(setProjectDeleting(false));
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
    projectForm,
    assignMember,
    removeMember,
    removeProject,
    loadProject,
    error: projectState.error,
    isLoading: projectState.detailLoading,
    isSubmitting: projectState.submitting,
    isDeleting: projectState.deleting,
  };
}
