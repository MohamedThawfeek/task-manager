import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Formhandel from "../../components/formik/FormikFields";
import { projectSchema } from "../../validations/forms";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { selectTeamRows, setTeamRows } from "../../redux/slice/team";
import {
  deleteProject as removeProjectFromStore,
  setProjectDeleting,
  setProjectError,
  setProjectListLoading,
  setProjects,
  setProjectSubmitting,
} from "../../redux/slice/project";
import { removeProjectTasks, selectTasks } from "../../redux/slice/task";
import {
  formatProject,
  formatUser,
  makeProjectBody,
} from "../../utils/apiData";
import api from "../../service/axios";
import { apiPath } from "../../service/path";

export default function useProjects() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const projectState = useAppSelector((state) => state.project);
  const projects = projectState.items;
  const tasks = useAppSelector(selectTasks);
  const access = useAppSelector((state) => state.auth.user?.access || "User");
  const team = useAppSelector(selectTeamRows);
  const [filter, setFilter] = useState("All Projects");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const list = projects.filter(
    (project) => filter === "All Projects" || project.status === filter,
  );

  const loadProjects = useCallback(async () => {
    dispatch(setProjectListLoading(true));
    dispatch(setProjectError(""));
    try {
      const url =
        String(access).toLowerCase() === "admin"
          ? apiPath.projects
          : apiPath.userProjects;
      const response = await api.get(url, "Unable to load projects");
      const rows = (
        Array.isArray(response.projects) ? response.projects : []
      ).map(formatProject);
      dispatch(setProjects(rows));
      return rows;
    } catch (error) {
      dispatch(setProjectError(error.message || "Unable to load projects"));
      throw error;
    } finally {
      dispatch(setProjectListLoading(false));
    }
  }, [access, dispatch]);

  useEffect(() => {
    loadProjects().catch(() => undefined);

    const loadUsers = async () => {
      const response = await api.get(apiPath.users, "Unable to load users");
      const users = (Array.isArray(response.users) ? response.users : []).map(
        formatUser,
      );
      dispatch(setTeamRows(users));
    };

    loadUsers().catch(() => undefined);
  }, [dispatch, loadProjects]);

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

  const saveProject = async (values) => {
    dispatch(setProjectSubmitting(true));
    dispatch(setProjectError(""));
    try {
      const project = editing ? { ...editing, ...values } : values;
      const result = editing
        ? await api.put(
            apiPath.updateProject,
            makeProjectBody(project, true),
            "Unable to update project",
          )
        : await api.post(
            apiPath.createProject,
            makeProjectBody(project),
            "Unable to create project",
          );
      await loadProjects();
      toast.success(
        result.message || (editing ? "Project updated" : "Project created"),
      );
      closeModal();
    } catch (error) {
      dispatch(setProjectError(error.message || "Unable to save project"));
      toast.error(error.message || "Unable to save project");
    } finally {
      dispatch(setProjectSubmitting(false));
    }
  };

  const projectForm = Formhandel({
    initialValue: {
      name: editing?.name || "",
      description: editing?.description || "",
      status: editing?.status || "Active",
      progress: editing?.progress || 0,
      memberIds: editing?.memberIds || [],
      dueDate: editing?.dueDate || "",
    },
    schema: projectSchema,
    submitFunction: saveProject,
    enableReinitialize: true,
  });

  const confirmDelete = async () => {
    if (!deleting) return;
    dispatch(setProjectDeleting(true));
    dispatch(setProjectError(""));
    try {
      const result = await api.delete(
        apiPath.deleteProject,
        { project_id: deleting.id },
        "Unable to delete project",
      );
      dispatch(removeProjectFromStore(deleting.id));
      dispatch(removeProjectTasks(deleting.id));
      setDeleting(null);
      toast.success(result.message || "Project deleted");
    } catch (error) {
      dispatch(setProjectError(error.message || "Unable to delete project"));
      toast.error(error.message || "Unable to delete project");
    } finally {
      dispatch(setProjectDeleting(false));
    }
  };

  return {
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
    projectForm,
    confirmDelete,
    loadProjects,
    error: projectState.error,
    isLoading: projectState.listLoading,
    isSubmitting: projectState.submitting,
    isDeleting: projectState.deleting,
    access,
  };
}
